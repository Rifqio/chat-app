import { Server } from 'socket.io'
import type { Server as HttpServer } from 'http'
import { logger } from '../config/logger.js'
import { env } from '../config/env.js'
import { presenceStore } from './presence.js'
import { messagesService } from './messages.service.js'
import { prisma } from './prisma.js'

let ioInstance: Server | null = null

const emitToUsers = (userIds: string[], event: string, payload: unknown) => {
    userIds.forEach((uid) => {
        const sockets = presenceStore.getSockets(uid)
        sockets.forEach((sid) => {
            ioInstance?.to(sid).emit(event, payload)
        })
    })
}

export const setupWebsocket = (server: HttpServer) => {
    ioInstance = new Server(server, {
        cors: {
            origin: env.corsOrigins.length ? env.corsOrigins : true,
            credentials: true,
        },
    })

    ioInstance.on('connection', (socket) => {
        const userId = socket.handshake.auth?.userId as string | undefined

        if (!userId) {
            logger.warn('Websocket connection missing userId', { socketId: socket.id })
            socket.disconnect(true)
            return
        }

        const firstConnection = presenceStore.onConnect(userId, socket.id)
        logger.info('Websocket client connected', { socketId: socket.id, userId })

        if (firstConnection) {
            ioInstance?.emit('presence:update', {
                userId,
                status: 'online',
                onlineCount: presenceStore.getOnlineCount(),
            })
        }

        socket.emit('presence:summary', {
            onlineUsers: presenceStore.getOnlineUsers(),
            onlineCount: presenceStore.getOnlineCount(),
        })

        socket.on('ping', () => socket.emit('pong'))

        socket.on(
            'message:send',
            async ({
                conversationId,
                content,
                mediaKey,
                mediaMimeType,
            }: {
                conversationId: string
                content?: string
                mediaKey?: string
                mediaMimeType?: string
            }) => {
                try {
                    await messagesService.assertParticipant(conversationId, userId)

                    const message = await messagesService.create(
                        userId,
                        conversationId,
                        content,
                        undefined,
                        mediaKey,
                        mediaMimeType,
                    )
                    const participants =
                        await messagesService.getParticipantIds(conversationId)
                    emitToUsers(participants, 'message:new', message)
                } catch (error) {
                    logger.error('message:send failed', {
                        error,
                        userId,
                        conversationId,
                    })
                    socket.emit('error', { message: 'Failed to send message' })
                }
            },
        )

        socket.on(
            'message:delivered',
            async ({
                conversationId,
                messageId,
            }: {
                conversationId: string
                messageId: string
            }) => {
                try {
                    await messagesService.assertParticipant(conversationId, userId)
                    const message = await prisma.message.findUnique({
                        where: { id: messageId },
                        select: { conversationId: true, senderId: true },
                    })
                    if (!message || message.conversationId !== conversationId)
                        return
                    if (message.senderId === userId) return
                    emitToUsers(
                        [message.senderId],
                        'message:delivered',
                        { conversationId, messageId },
                    )
                } catch (error) {
                    logger.error('message:delivered failed', {
                        error,
                        userId,
                        conversationId,
                        messageId,
                    })
                }
            },
        )

        socket.on(
            'message:read',
            async ({
                conversationId,
                messageId,
            }: {
                conversationId: string
                messageId: string
            }) => {
                try {
                    const updated = await messagesService.markAsRead(
                        userId,
                        conversationId,
                        messageId,
                    )
                    const participants =
                        await messagesService.getParticipantIds(conversationId)
                    emitToUsers(participants, 'message:read', {
                        messageId,
                        conversationId,
                    })
                } catch (error) {
                    logger.error('message:read failed', {
                        error,
                        userId,
                        conversationId,
                        messageId,
                    })
                }
            },
        )

        socket.on(
            'typing:start',
            async ({ conversationId }: { conversationId: string }) => {
                try {
                    await messagesService.assertParticipant(conversationId, userId)
                    const participants =
                        await messagesService.getParticipantIds(conversationId)
                    const targets = participants.filter((p) => p !== userId)
                    emitToUsers(targets, 'typing:start', {
                        conversationId,
                        userId,
                    })
                } catch (error) {
                    logger.error('typing:start failed', {
                        error,
                        userId,
                        conversationId,
                    })
                }
            },
        )

        socket.on(
            'typing:stop',
            async ({ conversationId }: { conversationId: string }) => {
                try {
                    await messagesService.assertParticipant(conversationId, userId)
                    const participants =
                        await messagesService.getParticipantIds(conversationId)
                    const targets = participants.filter((p) => p !== userId)
                    emitToUsers(targets, 'typing:stop', {
                        conversationId,
                        userId,
                    })
                } catch (error) {
                    logger.error('typing:stop failed', {
                        error,
                        userId,
                        conversationId,
                    })
                }
            },
        )

        socket.on('disconnect', (reason) => {
            const wentOffline = presenceStore.onDisconnect(userId, socket.id)
            logger.info('Websocket client disconnected', {
                socketId: socket.id,
                userId,
                reason,
            })
            if (wentOffline) {
                ioInstance?.emit('presence:update', {
                    userId,
                    status: 'offline',
                    onlineCount: presenceStore.getOnlineCount(),
                })
            }
        })
    })

    return ioInstance
}

export const getIO = () => {
    if (!ioInstance) {
        throw new Error('Websocket not initialized')
    }
    return ioInstance
}

export const emitUserUpdate = (user: {
    id: string
    name: string
    email: string
    about?: string
    avatar?: string
    status: 'online' | 'offline' | 'away'
}) => {
    ioInstance?.emit('user:update', user)
}
