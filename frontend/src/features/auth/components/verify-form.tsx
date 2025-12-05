import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, KeyRound, RotateCw } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { api } from '@/services'
import { useAuthStore } from '@/stores'

const verifySchema = z.object({
    email: z.string().email('Please enter a valid email'),
    code: z
        .string()
        .min(6, 'Code must be 6 digits')
        .max(6, 'Code must be 6 digits')
        .regex(/^\d+$/, 'Code must be numeric'),
})

type VerifyFormData = z.infer<typeof verifySchema>

interface VerifyFormProps {
    initialEmail?: string
    onBackToLogin: () => void
    onVerified?: () => void
}

export function VerifyForm({
    initialEmail,
    onBackToLogin,
    onVerified,
}: VerifyFormProps) {
    const { login, setLoading, isLoading } = useAuthStore()
    const [resendMessage, setResendMessage] = useState<string | null>(null)
    const [resendError, setResendError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<VerifyFormData>({
        resolver: zodResolver(verifySchema),
        defaultValues: {
            email: initialEmail ?? '',
            code: '',
        },
    })

    const onSubmit = async (data: VerifyFormData) => {
        try {
            setLoading(true)
            const response = await api.auth.verify({
                email: data.email,
                code: data.code,
            })

            login(
                {
                    ...response.user,
                    avatar: response.user.avatar || undefined,
                    about: response.user.about || '',
                    status: 'online' as const,
                },
                response.token,
            )
            onVerified?.()
        } catch (error) {
            setError('root', {
                message:
                    error instanceof Error
                        ? error.message
                        : 'Verification failed',
            })
            setLoading(false)
        }
    }

    const handleResend = async (email: string) => {
        setResendMessage(null)
        setResendError(null)
        try {
            await api.auth.resend({ email })
            setResendMessage('Verification code resent. Check your email.')
        } catch (error) {
            setResendError(
                error instanceof Error
                    ? error.message
                    : 'Failed to resend code',
            )
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
                {...register('email')}
                type="email"
                label="Email"
                placeholder="Enter your email"
                error={errors.email?.message}
                leftIcon={<Mail className="h-4 w-4" />}
                autoComplete="email"
            />

            <Input
                {...register('code')}
                type="text"
                label="Verification code"
                placeholder="Enter the 6-digit code"
                error={errors.code?.message}
                leftIcon={<KeyRound className="h-4 w-4" />}
                inputMode="numeric"
                maxLength={6}
            />

            {errors.root && (
                <p className="text-sm text-red-500 text-center">
                    {errors.root.message}
                </p>
            )}
            {resendMessage && (
                <p className="text-sm text-emerald-600 text-center">
                    {resendMessage}
                </p>
            )}
            {resendError && (
                <p className="text-sm text-red-500 text-center">{resendError}</p>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading}>
                Verify email
            </Button>

            <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => handleResend(initialEmail ?? '')}
            >
                <RotateCw className="h-4 w-4" />
                Resend code
            </Button>

            <p className="text-center text-sm text-slate-600">
                Already verified?{' '}
                <button
                    type="button"
                    onClick={onBackToLogin}
                    className="font-medium text-slate-900 hover:text-slate-700 transition-colors"
                >
                    Sign in
                </button>
            </p>
        </form>
    )
}

