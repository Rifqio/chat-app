import { cn, getInitials } from '@/lib/utils';
import type { UserStatus } from '@/types';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
    src?: string;
    name: string;
    size?: AvatarSize;
    status?: UserStatus;
    className?: string;
    onClick?: () => void;
}

const sizeStyles: Record<AvatarSize, string> = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-20 w-20 text-xl',
};

const statusSizeStyles: Record<AvatarSize, string> = {
    xs: 'h-1.5 w-1.5 ring-1',
    sm: 'h-2 w-2 ring-1',
    md: 'h-2.5 w-2.5 ring-2',
    lg: 'h-3 w-3 ring-2',
    xl: 'h-4 w-4 ring-2',
};

const statusColors: Record<UserStatus, string> = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-400',
    away: 'bg-amber-500',
};

export function Avatar({
    src,
    name,
    size = 'md',
    status,
    className,
    onClick,
}: AvatarProps) {
    const initials = getInitials(name);

    return (
        <div
            className={cn(
                'relative inline-flex shrink-0',
                onClick && 'cursor-pointer',
            )}
            onClick={onClick}
        >
            {src ? (
                <img
                    src={src}
                    alt={name}
                    className={cn(
                        'rounded-full object-cover',
                        sizeStyles[size],
                        className,
                    )}
                />
            ) : (
                <div
                    className={cn(
                        'flex items-center justify-center rounded-full bg-slate-900 font-medium text-white',
                        sizeStyles[size],
                        className,
                    )}
                >
                    {initials}
                </div>
            )}
            {status && (
                <span
                    className={cn(
                        'absolute bottom-0 right-0 rounded-full ring-white',
                        statusSizeStyles[size],
                        statusColors[status],
                    )}
                />
            )}
        </div>
    );
}
