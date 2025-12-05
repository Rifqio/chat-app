import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { AuthLayout } from '@/layouts';
import { LoginForm, RegisterForm, VerifyForm } from '@/features/auth';
import { useAuthStore } from '@/stores';

type AuthMode = 'login' | 'register' | 'verify';

export function AuthPage() {
    const navigate = useNavigate();
    const [mode, setMode] = useState<AuthMode>('login');
    const [pendingEmail, setPendingEmail] = useState<string>('');
    const [, setPendingName] = useState<string>('');
    const [, setPendingUserId] = useState<string | undefined>(
        undefined,
    );
    const { isAuthenticated } = useAuthStore();

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const isLogin = mode === 'login';
    const isRegister = mode === 'register';

    return (
        <AuthLayout
            title={
                isLogin
                    ? 'Welcome back'
                    : isRegister
                    ? 'Create an account'
                    : 'Verify your email'
            }
            subtitle={
                isLogin
                    ? 'Sign in to continue to Chatter'
                    : isRegister
                    ? 'Sign up to get started with Chatter'
                    : 'Enter the code we sent to your email'
            }
        >
            {mode === 'login' && (
                <LoginForm onSwitchToRegister={() => setMode('register')} />
            )}

            {mode === 'register' && (
                <RegisterForm
                    onSwitchToLogin={() => setMode('login')}
                    onRegistered={({ email, name, userId }) => {
                        setPendingEmail(email);
                        setPendingName(name);
                        setPendingUserId(userId);
                        setMode('verify');
                    }}
                />
            )}

            {mode === 'verify' && (
                <VerifyForm
                    initialEmail={pendingEmail}
                    onBackToLogin={() => setMode('login')}
                    onVerified={() => navigate('/', { replace: true })}
                />
            )}
        </AuthLayout>
    );
}
