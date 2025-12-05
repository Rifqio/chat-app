import type { NextFunction, Request, Response } from 'express'
import type { ApiResponse } from '../types/express.js'
import { logger } from '../config/logger.js'

const send = <T>(
    res: Response,
    status: number,
    data?: T,
    message?: string,
    details?: Record<string, unknown>,
) => {
    const payload: ApiResponse<T> = {
        success: status < 400,
    }

    if (message) payload.message = message
    if (data !== undefined) payload.data = data
    if (details) payload.details = details

    const logMethod = status >= 500 ? 'error' : null
    if (logMethod) {
        logger[logMethod]('RESP', {
            path: res.req?.originalUrl,
            status,
            msg: payload.message,
        })
    }

    if (status === 204) {
        return res.status(status).send()
    }

    return res.status(status).json(payload)
}

export const responseFormatter = (
    _req: Request,
    res: Response,
    next: NextFunction,
) => {
    res.success = <T>(data?: T, message?: string) =>
        send(res, 200, data, message)
    res.created = <T>(data?: T, message?: string) =>
        send(res, 201, data, message)
    res.noContent = () => send(res, 204)
    res.fail = (
        message: string,
        statusCode = 400,
        details?: Record<string, unknown>,
    ) => send(res, statusCode, undefined, message, details)

    next()
}
