import { Server } from 'socket.io'
import type { Server as HttpServer } from 'http'
import { logger } from '../config/logger.js'
import { env } from '../config/env.js'
import { presenceStore } from './presence.js'

export const setupWebsocket = (server: HttpServer) => {
    const io = new Server(server, {
        cors: {
            origin: env.corsOrigins.length ? env.corsOrigins : true,
            credentials: true,
        },
    })

    io.on('connection', (socket) => {
        const userId = socket.handshake.auth?.userId as string | undefined

        if (!userId) {
            logger.warn('Websocket connection missing userId', { socketId: socket.id })
            socket.disconnect(true)
            return
        }

        const firstConnection = presenceStore.onConnect(userId, socket.id)
        logger.info('Websocket client connected', { socketId: socket.id, userId })

        if (firstConnection) {
            io.emit('presence:update', {
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

        socket.on('disconnect', (reason) => {
            const wentOffline = presenceStore.onDisconnect(userId, socket.id)
            logger.info('Websocket client disconnected', {
                socketId: socket.id,
                userId,
                reason,
            })
            if (wentOffline) {
                io.emit('presence:update', {
                    userId,
                    status: 'offline',
                    onlineCount: presenceStore.getOnlineCount(),
                })
            }
        })
    })

    return io
}
