import jwt, { type Secret, type SignOptions } from 'jsonwebtoken'
import type { StringValue } from 'ms'
import { env } from '../config/env.js'
import type { AuthUser } from '../types/express.js'

export type TokenPayload = AuthUser & jwt.JwtPayload

export const signToken = (
    payload: TokenPayload,
    expiresIn = env.jwtExpiresIn,
) => {
    const secret: Secret = env.jwtSecret
    const expiresInValue: StringValue | number =
        typeof expiresIn === 'number'
            ? expiresIn
            : ((expiresIn ?? '1d') as StringValue)
    const options: SignOptions = {
        expiresIn: expiresInValue,
    }
    return jwt.sign(payload, secret, options)
}

export const verifyToken = (token: string): TokenPayload =>
    jwt.verify(token, env.jwtSecret) as TokenPayload
