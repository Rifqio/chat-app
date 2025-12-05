import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { loginSchema, type LoginFormData } from '@/lib/validators'
import { useAuthStore } from '@/stores'
import { api } from '@/services'

interface LoginFormProps {
    onSwitchToRegister: () => void
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false)
    const { login, setLoading, isLoading } = useAuthStore()

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const onSubmit = async (data: LoginFormData) => {
        try {
            setLoading(true)
            const response = await api.auth.login(data)
            const user = {
                ...response.user,
                // Fallbacks for optional fields
                avatar: response.user.avatar || undefined,
                about: response.user.about || '',
                status: 'online' as const,
            }
            login(user, response.token)
        } catch (error) {
            setError('root', {
                message:
                    error instanceof Error ? error.message : 'Login failed',
            })
            setLoading(false)
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
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Enter your password"
                error={errors.password?.message}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="hover:text-slate-600 transition-colors"
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                }
                autoComplete="current-password"
            />

            {errors.root && (
                <p className="text-sm text-red-500 text-center">
                    {errors.root.message}
                </p>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading}>
                Sign in
            </Button>

            {/* Demo credentials hint */}
            <div className="p-3 bg-slate-50 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">Demo credentials:</p>
                <p className="text-xs font-mono text-slate-600">
                    demo@example.com / Demo123!
                </p>
            </div>

            <p className="text-center text-sm text-slate-600">
                Don't have an account?{' '}
                <button
                    type="button"
                    onClick={onSwitchToRegister}
                    className="font-medium text-slate-900 hover:text-slate-700 transition-colors"
                >
                    Create account
                </button>
            </p>
        </form>
    )
}
