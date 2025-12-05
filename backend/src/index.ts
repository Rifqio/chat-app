import express from 'express'
import compression from 'compression'
import cors from 'cors'
import helmet from 'helmet'
import { createServer } from 'http'
import { env } from './config/env.js'
import { logger } from './config/logger.js'
import { requestLogger } from './middleware/requestLogger.js'
import { responseFormatter } from './middleware/responseFormatter.js'
import { errorHandler } from './middleware/errorHandler.js'
import router from './routes/index.js'
import { setupWebsocket } from './services/websocket.js'
import { connectPrisma, disconnectPrisma } from './services/prisma.js'

const app = express()

app.disable('x-powered-by')
app.use(helmet())
app.use(
    cors({
        origin: env.corsOrigins.length ? env.corsOrigins : true,
        credentials: true,
    }),
)
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(compression())

app.use(responseFormatter)
app.use(requestLogger)

app.use('/api', router)

app.use((_, res) => res.fail('Not found', 404))

app.use(errorHandler)

const server = createServer(app)
setupWebsocket(server)

const bootstrap = async () => {
    try {
        await connectPrisma()
        server.listen(env.port, () => {
            logger.info(`Server listening on port ${env.port}`)
        })
    } catch (error) {
        logger.error('Failed to start server', { error })
        process.exit(1)
    }
}

bootstrap()

const gracefulShutdown = async () => {
    logger.info('Shutting down gracefully')
    server.close(async () => {
        await disconnectPrisma()
        process.exit(0)
    })
}

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)
