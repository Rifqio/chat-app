import { Link } from 'react-router';
import { Home, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui';

export function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="text-center">
                <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="h-10 w-10 text-slate-900" />
                </div>
                <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-slate-700 mb-2">
                    Page not found
                </h2>
                <p className="text-slate-500 mb-8 max-w-md">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Link to="/">
                    <Button>
                        <Home className="h-4 w-4" />
                        Back to Home
                    </Button>
                </Link>
            </div>
        </div>
    );
}
