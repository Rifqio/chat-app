import { prisma } from './prisma.js'
import { presenceStore } from './presence.js'
import { emitUserUpdate } from './websocket.js'
import { BadRequestException } from '../errors/httpExceptions.js'
import { uploadObject, getObjectUrl, getProfileImageUrl } from './s3Client.js'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'
import { randomUUID } from 'crypto'

const serializeUser = async (user: {
    id: string
    name: string
    email: string
    about: string | null
    avatarUrl: string | null
    status: string
    lastLoginAt: Date | null
    createdAt: Date
}) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    about: user.about ?? '',
    avatar: await getProfileImageUrl(user.avatarUrl),
    status: presenceStore.isOnline(user.id)
        ? ('online' as const)
        : ('offline' as const),
    lastLoginAt: user.lastLoginAt ?? undefined,
    createdAt: user.createdAt,
})

export const usersService = {
    async list () {
        const users = await prisma.user.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                email: true,
                about: true,
                avatarUrl: true,
                status: true,
                lastLoginAt: true,
                createdAt: true,
            },
        })

        const serialized = await Promise.all(users.map((u) => serializeUser(u)))
        return serialized
    },

    async updateProfile (
        userId: string,
        input: { name?: string; about?: string; avatar?: string },
    ) {
        const updates: {
            name?: string
            about?: string | null
            avatarUrl?: string | null
        } = {}

        if (input.name !== undefined) {
            const trimmed = input.name.trim()
            if (!trimmed) {
                throw new BadRequestException('Name is required')
            }
            if (trimmed.length < 2) {
                throw new BadRequestException(
                    'Name must be at least 2 characters',
                )
            }
            updates.name = trimmed
        }

        if (input.about !== undefined) {
            updates.about = input.about.trim() || null
        }

        if (input.avatar !== undefined) {
            updates.avatarUrl = input.avatar || null
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: updates,
            select: {
                id: true,
                name: true,
                email: true,
                about: true,
                avatarUrl: true,
                status: true,
                lastLoginAt: true,
                createdAt: true,
            },
        })

        const serialized = await serializeUser(user)
        emitUserUpdate(serialized)
        return serialized
    },

    async uploadProfileImage(
        userId: string,
        file?: {
            buffer: Buffer
            mimetype: string
            size: number
            originalname: string
        },
    ): Promise<{ key: string; url: string }> {
        if (!file) {
            throw new BadRequestException('No file uploaded')
        }

        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            throw new BadRequestException('File too large. Max size is 5MB')
        }

        const allowedTypes = new Set([
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
        ])

        if (!allowedTypes.has(file.mimetype)) {
            throw new BadRequestException('Only image files are allowed')
        }

        const extension =
            file.originalname.split('.').pop() ||
            file.mimetype.split('/')[1] ||
            'img'
        const key = `profiles/${userId}/${randomUUID()}.${extension}`
        const bucket = env.aws.profileImageBucket || env.aws.bucket

        logger.info('Uploading profile image', {
            userId,
            key,
            bucket,
            size: file.size,
            mimetype: file.mimetype,
        })

        await uploadObject(key, file.buffer, file.mimetype, bucket)

        const url = await getObjectUrl(key, 15 * 60, bucket)

        logger.info('Profile image uploaded', { userId, key, bucket })

        return { key, url }
    },
}
