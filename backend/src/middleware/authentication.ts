import type { NextFunction, Request, Response } from 'express'
import { UnauthorizedException } from '../errors/httpExceptions.js'
import { verifyToken } from '../utils/jwt.js'

export const authenticate = (
    req: Request,
    _res: Response,
    next: NextFunction,
) => {
    const header = req.get('authorization')
    if (!header || !header.startsWith('Bearer ')) {
        return next(new UnauthorizedException('Missing authorization header'))
    }

    const token = header.replace('Bearer ', '')

    try {
        const payload = verifyToken(token)
        req.user = payload
        return next()
    } catch {
        return next(new UnauthorizedException('Invalid or expired token'))
    }
}
