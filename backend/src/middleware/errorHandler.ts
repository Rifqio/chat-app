import type { ErrorRequestHandler } from 'express'
import { logger } from '../config/logger.js'
import { AppError } from '../errors/AppError.js'

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    const appError =
        err instanceof AppError
            ? err
            : new AppError('Internal server error', 500)

    const logMethod = appError.statusCode >= 500 ? 'error' : 'warn'
    logger[logMethod](appError.message, {
        statusCode: appError.statusCode,
        details: appError.details,
        stack: appError.stack,
    })

    return res.fail(appError.message, appError.statusCode, appError.details)
}
