import { Router } from 'express'
import { authController } from '../../controllers/auth.controller.js'
import { validate } from '../../middleware/validate.js'
import { registerSchema, verifySchema, loginSchema, resendSchema } from '../../schemas/auth.schema.js'

export const authRoutes = Router()

authRoutes.post('/register', validate({ body: registerSchema }), authController.register)
authRoutes.post('/verify', validate({ body: verifySchema }), authController.verify)
authRoutes.post('/resend', validate({ body: resendSchema }), authController.resend)
authRoutes.post(
    '/login',
    validate({ body: loginSchema }),
    authController.login,
)

