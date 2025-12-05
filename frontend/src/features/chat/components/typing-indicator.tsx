import { Avatar } from '@/components/ui';
import type { User } from '@/types';

interface TypingIndicatorProps {
    user: User;
}

export function TypingIndicator({ user }: TypingIndicatorProps) {
    return (
        <div className="flex items-center gap-2 px-4 py-2">
            <Avatar src={user.avatar} name={user.name} size="sm" />
            <div className="flex items-center gap-1 px-4 py-2.5 bg-slate-100 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" />
                </div>
            </div>
        </div>
    );
}
