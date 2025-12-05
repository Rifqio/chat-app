import { PrismaClient } from '@prisma/client'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'

export const prisma = new PrismaClient({
    log:
        env.nodeEnv === 'development'
            ? ['query', 'info', 'warn', 'error']
            : ['error'],
})

export const connectPrisma = async () => {
    await prisma.$connect()
    logger.info('Connected to PostgreSQL via Prisma')
}

export const disconnectPrisma = async () => {
    await prisma.$disconnect()
    logger.info('Prisma client disconnected')
}
