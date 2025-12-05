import { Server } from 'socket.io'
import type { Server as HttpServer } from 'http'
import { logger } from '../config/logger.js'
import { env } from '../config/env.js'

export const setupWebsocket = (server: HttpServer) => {
    const io = new Server(server, {
        cors: {
            origin: env.corsOrigins.length ? env.corsOrigins : true,
            credentials: true,
        },
    })

    io.on('connection', (socket) => {
        logger.info('Websocket client connected', { socketId: socket.id })

        socket.on('ping', () => socket.emit('pong'))

        socket.on('disconnect', (reason) => {
            logger.info('Websocket client disconnected', {
                socketId: socket.id,
                reason,
            })
        })
    })

    return io
}
