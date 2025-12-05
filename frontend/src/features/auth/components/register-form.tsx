import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { registerSchema, type RegisterFormData } from '@/lib/validators'
import { useAuthStore } from '@/stores'
import { api } from '@/services'

interface RegisterFormProps {
    onSwitchToLogin: () => void
    onRegistered: (input: { email: string; name: string; userId?: string }) => void
}

export function RegisterForm({ onSwitchToLogin, onRegistered }: RegisterFormProps) {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const { setLoading, isLoading } = useAuthStore()

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            passwordConfirmation: '',
        },
    })

    const onSubmit = async (data: RegisterFormData) => {
        try {
            setLoading(true)
            const response = await api.auth.register({
                name: data.name,
                email: data.email,
                password: data.password,
                passwordConfirmation: data.passwordConfirmation,
            })
            onRegistered({
                email: response.email,
                name: data.name,
                userId: response.userId,
            })
            setLoading(false)
        } catch (error) {
            setError('root', {
                message:
                    error instanceof Error
                        ? error.message
                        : 'Registration failed',
            })
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
                {...register('name')}
                type="text"
                label="Full Name"
                placeholder="Enter your full name"
                error={errors.name?.message}
                leftIcon={<User className="h-4 w-4" />}
                autoComplete="name"
            />

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
                placeholder="Create a password"
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
                autoComplete="new-password"
            />

            <Input
                {...register('passwordConfirmation')}
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm Password"
                placeholder="Confirm your password"
                error={errors.passwordConfirmation?.message}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                    <button
                        type="button"
                        onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="hover:text-slate-600 transition-colors"
                    >
                        {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                }
                autoComplete="new-password"
            />

            {errors.root && (
                <p className="text-sm text-red-500 text-center">
                    {errors.root.message}
                </p>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading}>
                Create account
            </Button>

            <p className="text-center text-sm text-slate-600">
                Already have an account?{' '}
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="font-medium text-slate-900 hover:text-slate-700 transition-colors"
                >
                    Sign in
                </button>
            </p>
        </form>
    )
}
