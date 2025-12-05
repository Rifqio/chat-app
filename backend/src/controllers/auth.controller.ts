import type { Request, Response } from 'express'
import { authService } from '../services/auth.service.js'

export const authController = {
    register: async (req: Request, res: Response) => {
        const { name, email, password } = req.body
        const result = await authService.register({ name, email, password })
        return res.created(result, 'Registration successful, check your email for the code')
    },

    verify: async (req: Request, res: Response) => {
        const { email, code } = req.body
        const result = await authService.verify({ email, code })
        return res.success(result, 'Account verified')
    },

    resend: async (req: Request, res: Response) => {
        const { email } = req.body
        const result = await authService.resend({ email })
        return res.success(result, 'Verification code resent')
    },

    login: async (req: Request, res: Response) => {
        const { email, password } = req.body
        const result = await authService.login({ email, password })
        return res.success(result, 'Logged in')
    },
}

