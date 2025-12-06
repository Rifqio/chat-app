import { prisma } from './prisma.js'
import {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
} from '../errors/httpExceptions.js'
import { getUserMediaUrl, uploadObject } from './s3Client.js'
import { randomUUID } from 'crypto'

const serializeMessage = async (message: {
    id: string
    conversationId: string
    senderId: string
    content: string | null
    isRead: boolean
    createdAt: Date
    media?: { url: string | null; mimeType: string | null }[]
}) => {
    const mediaUrl = message.media?.[0]?.url
    const signedMediaUrl = mediaUrl ? await getUserMediaUrl(mediaUrl) : undefined
    const hasMedia = Boolean(signedMediaUrl)
    const contentText = (message.content ?? '').trim()
    const displayContent =
        contentText.length > 0 ? contentText : hasMedia ? 'Photo' : ''

    return {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: displayContent,
        imageUrl: signedMediaUrl,
        status: message.isRead ? ('read' as const) : ('sent' as const),
        createdAt: message.createdAt,
    }
}

async function ensureParticipant (conversationId: string, userId: string) {
    const participant = await prisma.conversationParticipant.findFirst({
        where: { conversationId, userId },
        select: { id: true },
    })

    if (!participant) {
        throw new ForbiddenException(
            'You are not a participant of this conversation',
        )
    }
}

export const messagesService = {
    async listByConversation (
        userId: string,
        conversationId: string,
        page = 1,
        limit = 50,
    ) {
        await ensureParticipant(conversationId, userId)

        const skip = (page - 1) * limit
        const items = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit + 1,
            include: {
                media: {
                    select: { url: true, mimeType: true },
                },
            },
        })

        const hasMore = items.length > limit
        const sliced = hasMore ? items.slice(0, limit) : items
        const serialized = await Promise.all(
            sliced.map((m) => serializeMessage(m)),
        )

        // Return chronological order (oldest first)
        return { messages: serialized.reverse(), hasMore }
    },

    async getParticipantIds (conversationId: string) {
        const participants = await prisma.conversationParticipant.findMany({
            where: { conversationId },
            select: { userId: true },
        })
        if (!participants.length) {
            throw new NotFoundException('Conversation not found')
        }
        return participants.map((p) => p.userId)
    },

    async assertParticipant (conversationId: string, userId: string) {
        await ensureParticipant(conversationId, userId)
    },

    async create (
        userId: string,
        conversationId: string,
        content?: string,
        _imageUrl?: string,
        mediaKey?: string,
        mediaMimeType?: string,
    ) {
        await ensureParticipant(conversationId, userId)

        if (!content && !mediaKey) {
            throw new BadRequestException(
                'Message content or image is required',
            )
        }

        const mediaData =
            mediaKey !== undefined && mediaKey !== null
                ? {
                      create: [
                          {
                              url: mediaKey,
                              mimeType: mediaMimeType ?? 'application/octet-stream',
                          },
                      ],
                  }
                : undefined

        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId: userId,
                type: mediaKey ? 'IMAGE' : 'TEXT',
                content: content ?? '',
                ...(mediaData ? { media: mediaData } : {}),
            },
            include: {
                media: {
                    select: { url: true, mimeType: true },
                },
            },
        })

        await prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() },
        })

        return serializeMessage(message)
    },

    async markAsRead (
        userId: string,
        conversationId: string,
        messageId: string,
    ) {
        await ensureParticipant(conversationId, userId)

        const message = await prisma.message.findUnique({
            where: { id: messageId },
            select: {
                id: true,
                conversationId: true,
                senderId: true,
                isRead: true,
                content: true,
                createdAt: true,
            },
        })

        if (!message || message.conversationId !== conversationId) {
            throw new NotFoundException('Message not found')
        }

        if (message.senderId === userId) {
            return serializeMessage(message)
        }

        if (!message.isRead) {
            await prisma.message.update({
                where: { id: messageId },
                data: { isRead: true },
            })

            await prisma.conversationParticipant.updateMany({
                where: { conversationId, userId },
                data: { lastReadAt: new Date() },
            })
        }

        const updated = await prisma.message.findUniqueOrThrow({
            where: { id: messageId },
        })

        return serializeMessage(updated)
    },

    async uploadMedia (
        userId: string,
        conversationId: string,
        file: {
            buffer: Buffer
            mimetype: string
            size: number
            originalname: string
        },
    ) {
        await ensureParticipant(conversationId, userId)

        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
            throw new BadRequestException('File too large. Max size is 5MB')
        }

        const extension =
            file.originalname.split('.').pop() ||
            file.mimetype.split('/')[1] ||
            'img'
        const key = `media/${conversationId}/${randomUUID()}.${extension}`

        await uploadObject(key, file.buffer, file.mimetype, 'user-media')

        const url = await getUserMediaUrl(key, 15 * 60)

        return { key, url, mimeType: file.mimetype }
    },
}
