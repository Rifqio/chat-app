import { Routes, Route } from 'react-router';
import { ProtectedRoute } from '@/components/protected-route';
import { AuthPage, ChatPage, NotFoundPage } from '@/pages';

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <ChatPage />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
