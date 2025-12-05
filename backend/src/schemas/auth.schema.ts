import { z } from 'zod'

export const registerSchema = z
    .object({
        name: z
            .string({ required_error: 'Name is required' })
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name must be at most 100 characters'),
        email: z.string({ required_error: 'Email is required' }).email('Invalid email'),
        password: z
            .string({ required_error: 'Password is required' })
            .min(8, 'Password must be at least 8 characters')
            .max(128, 'Password must be at most 128 characters'),
        passwordConfirmation: z
            .string({ required_error: 'Confirmation password is required' })
            .min(8, 'Confirmation password must be at least 8 characters')
            .max(128, 'Confirmation password must be at most 128 characters'),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
        message: 'Passwords must match',
        path: ['passwordConfirmation'],
    })

export const verifySchema = z.object({
    email: z.string().email(),
    code: z.string().length(6).regex(/^\d+$/, 'Code must be numeric'),
})

const passwordField = z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')

export const loginSchema = z.object({
    email: z.string().email(),
    password: passwordField,
})

export const resendSchema = z.object({
    email: z.string().email(),
})

