import { MessageSquare } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex">
            {/* Left - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 p-12 flex-col justify-center">
                <div className="max-w-md">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <MessageSquare className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">
                            Chatter
                        </span>
                    </div>

                    <div>
                        <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                            Connect with anyone, anywhere
                        </h1>
                        <p className="text-xl text-slate-300 leading-relaxed">
                            A modern chat experience that brings people together.
                            Simple, secure, and seamless messaging.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right - Auth Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
                        <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                            <MessageSquare className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-slate-900">
                            Chatter
                        </span>
                    </div>

                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 mb-3">
                            {title}
                        </h2>
                        <p className="text-slate-600 text-lg">{subtitle}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
