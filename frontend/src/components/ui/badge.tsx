import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-slate-100 text-slate-700',
    primary: 'bg-slate-100 text-slate-900',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
};

export function Badge({
    children,
    variant = 'default',
    className,
}: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium',
                variantStyles[variant],
                className,
            )}
        >
            {children}
        </span>
    );
}

interface UnreadBadgeProps {
    count: number;
    className?: string;
}

export function UnreadBadge({ count, className }: UnreadBadgeProps) {
    if (count === 0) return null;

    return (
        <span
            className={cn(
                'flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1.5 text-xs font-medium text-white',
                className,
            )}
        >
            {count > 99 ? '99+' : count}
        </span>
    );
}
