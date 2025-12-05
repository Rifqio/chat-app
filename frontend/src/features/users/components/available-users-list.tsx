import { Avatar } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

interface AvailableUsersListProps {
    users: User[];
    currentUserId: string;
    onUserClick: (user: User) => void;
}

export function AvailableUsersList({
    users,
    currentUserId,
    onUserClick,
}: AvailableUsersListProps) {
    const otherUsers = users.filter((u) => u.id !== currentUserId);
    const onlineUsers = otherUsers.filter((u) => u.status === 'online');
    const offlineUsers = otherUsers.filter((u) => u.status !== 'online');

    if (otherUsers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <p className="text-slate-500 text-sm">
                    No other users available
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-slate-100">
            {/* Online Users */}
            {onlineUsers.length > 0 && (
                <div>
                    <div className="px-4 py-2 bg-slate-50">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Online — {onlineUsers.length}
                        </h3>
                    </div>
                    {onlineUsers.map((user) => (
                        <UserItem
                            key={user.id}
                            user={user}
                            onClick={() => onUserClick(user)}
                        />
                    ))}
                </div>
            )}

            {/* Offline Users */}
            {offlineUsers.length > 0 && (
                <div>
                    <div className="px-4 py-2 bg-slate-50">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Offline — {offlineUsers.length}
                        </h3>
                    </div>
                    {offlineUsers.map((user) => (
                        <UserItem
                            key={user.id}
                            user={user}
                            onClick={() => onUserClick(user)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface UserItemProps {
    user: User;
    onClick: () => void;
}

function UserItem({ user, onClick }: UserItemProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                'hover:bg-slate-50',
            )}
        >
            <Avatar
                src={user.avatar}
                name={user.name}
                size="md"
                status={user.status}
            />
            <div className="flex-1 min-w-0">
                <span className="font-medium text-slate-900">{user.name}</span>
                <p className="text-sm text-slate-500 truncate">{user.email}</p>
            </div>
        </button>
    );
}
