import type { NextFunction, Request, Response } from 'express'
import { logger } from '../config/logger.js'

export const requestLogger = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const start = process.hrtime.bigint()

    res.on('finish', () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000
        logger.http('HTTP', {
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            ms: durationMs.toFixed(1),
            ua: req.get('user-agent'),
            ip: req.ip,
        })
    })

    next()
}
