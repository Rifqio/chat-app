import type { NextFunction, Request, Response } from 'express'
import type { ZodError, ZodTypeAny } from 'zod'
import { BadRequestException } from '../errors/httpExceptions.js'

type Parsable = Pick<ZodTypeAny, 'parse'>

type Schema = {
    body?: Parsable
    query?: Parsable
    params?: Parsable
}

export const validate =
    (schema: Schema) => (req: Request, _res: Response, next: NextFunction) => {
        try {
            if (schema.body) {
                req.body = schema.body.parse(req.body)
            }
            if (schema.query) {
                const parsedQuery = schema.query.parse(req.query)
                Object.assign(req.query, parsedQuery)
            }
            if (schema.params) {
                req.params = schema.params.parse(req.params)
            }
            next()
        } catch (error) {
            if ((error as ZodError).issues) {
                const zodError = error as ZodError
                const details = zodError.issues.map((issue) => ({
                    path: issue.path.join('.'),
                    message: issue.message,
                }))
                return next(new BadRequestException('Validation failed', details))
            }
            return next(error)
        }
    }

