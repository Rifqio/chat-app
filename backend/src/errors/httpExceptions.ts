import { AppError } from './AppError.js'

export class BadRequestException extends AppError {
    constructor (message = 'Bad request', details?: unknown) {
        super(message, 400, details)
    }
}

export class UnauthorizedException extends AppError {
    constructor (message = 'Unauthorized', details?: unknown) {
        super(message, 401, details)
    }
}

export class ForbiddenException extends AppError {
    constructor (message = 'Forbidden', details?: unknown) {
        super(message, 403, details)
    }
}

export class NotFoundException extends AppError {
    constructor (message = 'Not found', details?: unknown) {
        super(message, 404, details)
    }
}

export class ConflictException extends AppError {
    constructor (message = 'Conflict', details?: unknown) {
        super(message, 409, details)
    }
}

export class InternalServerException extends AppError {
    constructor (message = 'Internal server error', details?: unknown) {
        super(message, 500, details)
    }
}
