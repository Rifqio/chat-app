import bcrypt from 'bcrypt'
import { prisma } from './prisma.js'
import { ConflictException, NotFoundException, UnauthorizedException } from '../errors/httpExceptions.js'
import { BadRequestException } from '../errors/httpExceptions.js'
import { sendMail } from './mailer.js'
import { logger } from '../config/logger.js'
import { signToken } from '../utils/jwt.js'
import { buildVerificationEmail } from '../templates/verificationEmail.js'

const OTP_LENGTH = 6
const OTP_EXPIRATION_MINUTES = 15
const SALT_ROUNDS = 10

const generateOtp = () =>
    Array.from({ length: OTP_LENGTH }, () => Math.floor(Math.random() * 10)).join('')

const serializeUser = (user: {
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
    avatar: user.avatarUrl ?? '',
    status: user.status,
    lastLoginAt: user.lastLoginAt ?? undefined,
    createdAt: user.createdAt,
})

export const authService = {
    async register(input: { name: string; email: string; password: string }) {
        const existing = await prisma.user.findUnique({ where: { email: input.email } })
        if (existing) {
            throw new ConflictException('Email already registered')
        }

        const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS)
        const otp = generateOtp()
        const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000)

        const user = await prisma.$transaction(async (tx) => {
            const createdUser = await tx.user.create({
                data: {
                    name: input.name,
                    email: input.email,
                    passwordHash,
                },
            })

            await tx.verificationCode.create({
                data: {
                    userId: createdUser.id,
                    code: otp,
                    expiresAt,
                },
            })

            return createdUser
        })

        try {
            await sendMail({
                to: input.email,
                subject: 'Your verification code',
                text: `Your verification code is ${otp}. It expires in ${OTP_EXPIRATION_MINUTES} minutes.`,
                html: buildVerificationEmail({
                    name: input.name,
                    code: otp,
                    expiresMinutes: OTP_EXPIRATION_MINUTES,
                }),
            })
        } catch (error) {
            logger.warn('Failed to send OTP email', { error })
        }

        return { userId: user.id, email: user.email }
    },

    async resend(input: { email: string }) {
        const user = await prisma.user.findUnique({ where: { email: input.email } })
        if (!user) {
            throw new NotFoundException('User not found')
        }
        if (user.status === 'VERIFIED') {
            throw new BadRequestException('Account already verified')
        }

        const otp = generateOtp()
        const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000)

        await prisma.verificationCode.create({
            data: {
                userId: user.id,
                code: otp,
                expiresAt,
            },
        })

        try {
            await sendMail({
                to: input.email,
                subject: 'Your verification code',
                text: `Your verification code is ${otp}. It expires in ${OTP_EXPIRATION_MINUTES} minutes.`,
                html: buildVerificationEmail({
                    name: user.name,
                    code: otp,
                    expiresMinutes: OTP_EXPIRATION_MINUTES,
                }),
            })
        } catch (error) {
            logger.warn('Failed to send OTP email', { error })
        }

        return { email: user.email }
    },

    async verify(input: { email: string; code: string }) {
        const user = await prisma.user.findUnique({ where: { email: input.email } })
        if (!user) {
            throw new NotFoundException('User not found')
        }

        const verification = await prisma.verificationCode.findFirst({
            where: {
                userId: user.id,
                code: input.code,
                consumedAt: null,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        })

        if (!verification) {
            throw new UnauthorizedException('Invalid or expired code')
        }

        const [_, updatedUser] = await prisma.$transaction([
            prisma.verificationCode.update({
                where: { id: verification.id },
                data: { consumedAt: new Date() },
            }),
            prisma.user.update({
                where: { id: user.id },
                data: { status: 'VERIFIED', lastLoginAt: new Date() },
            }),
        ])

        const token = signToken({ id: updatedUser.id, email: updatedUser.email })
        return { token, user: serializeUser(updatedUser) }
    },

    async login(input: { email: string; password: string }) {
        const user = await prisma.user.findUnique({ where: { email: input.email } })
        if (!user) throw new UnauthorizedException('Invalid credentials')

        const match = await bcrypt.compare(input.password, user.passwordHash)
        if (!match) throw new UnauthorizedException('Invalid credentials')

        if (user.status !== 'VERIFIED') {
            throw new BadRequestException('Account not verified')
        }

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        })

        const token = signToken({ id: user.id, email: user.email })

        return { token, user: serializeUser(updated) }
    },
}

