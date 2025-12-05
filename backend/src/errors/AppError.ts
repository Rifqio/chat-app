export class AppError extends Error {
    statusCode: number
    details?: unknown
    isOperational: boolean

    constructor (
        message: string,
        statusCode = 500,
        details?: unknown,
    ) {
        super(message)
        this.name = this.constructor.name
        this.statusCode = statusCode
        this.details = details ?? undefined
        this.isOperational = statusCode < 500
        Error.captureStackTrace?.(this, this.constructor)
    }
}
