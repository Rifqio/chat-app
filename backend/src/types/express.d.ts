import type { Response } from 'express'

declare global {
    namespace Express {
        interface Response {
            success<T = unknown>(data?: T, message?: string): this
            created<T = unknown>(data?: T, message?: string): this
            noContent(): this
            fail(
                message: string,
                statusCode?: number,
                details?: Record<string, unknown>,
            ): this
        }
    }
}

export type AuthUser = {
    id: string
    email?: string
    roles?: string[]
    [key: string]: unknown
}

export type ApiResponse<T = unknown> = {
    success: boolean
    message?: string
    data?: T
    details?: Record<string, unknown>
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser
        }
    }
}

// Ensures this file is treated as a module.
export {}
