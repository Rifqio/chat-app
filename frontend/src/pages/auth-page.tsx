import { useState } from 'react';
import { Navigate } from 'react-router';
import { AuthLayout } from '@/layouts';
import { LoginForm, RegisterForm } from '@/features/auth';
import { useAuthStore } from '@/stores';

type AuthMode = 'login' | 'register';

export function AuthPage() {
    const [mode, setMode] = useState<AuthMode>('login');
    const { isAuthenticated } = useAuthStore();

    // Redirect if already authenticated
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const isLogin = mode === 'login';

    return (
        <AuthLayout
            title={isLogin ? 'Welcome back' : 'Create an account'}
            subtitle={
                isLogin
                    ? 'Sign in to continue to Chatter'
                    : 'Sign up to get started with Chatter'
            }
        >
            {isLogin ? (
                <LoginForm onSwitchToRegister={() => setMode('register')} />
            ) : (
                <RegisterForm onSwitchToLogin={() => setMode('login')} />
            )}
        </AuthLayout>
    );
}
