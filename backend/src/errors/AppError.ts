export class AppError extends Error {
    statusCode: number
    details?: Record<string, unknown> | undefined
    isOperational: boolean

    constructor (
        message: string,
        statusCode = 500,
        details?: Record<string, unknown>,
    ) {
        super(message)
        this.name = this.constructor.name
        this.statusCode = statusCode
        this.details = details ?? undefined
        this.isOperational = statusCode < 500
        Error.captureStackTrace?.(this, this.constructor)
    }
}
