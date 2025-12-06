import { Avatar, UnreadBadge } from '@/components/ui';
import { cn, formatMessageTime } from '@/lib/utils';
import type { Conversation, User, MessageStatus } from '@/types';
import { Check, CheckCheck } from 'lucide-react';

interface UserListItemProps {
    conversation: Conversation;
    currentUser: User;
    isActive: boolean;
    onClick: () => void;
}

function MessageStatusIcon({ status }: { status: MessageStatus }) {
    switch (status) {
        case 'sending':
            return (
                <div className="h-3 w-3 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
            );
        case 'sent':
            return <Check className="h-3.5 w-3.5 text-slate-400" />;
        case 'delivered':
            return <CheckCheck className="h-3.5 w-3.5 text-slate-400" />;
        case 'read':
            return <CheckCheck className="h-3.5 w-3.5 text-slate-600" />;
        default:
            return null;
    }
}

export function UserListItem({
    conversation,
    currentUser,
    isActive,
    onClick,
}: UserListItemProps) {
    const otherParticipant = conversation.participants.find(
        (p) => p.id !== currentUser.id,
    );

    if (!otherParticipant) return null;

    const { lastMessage } = conversation;
    const isOwnMessage = lastMessage?.senderId === currentUser.id;

    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                'hover:bg-slate-50',
                isActive && 'bg-slate-50 hover:bg-slate-50',
            )}
        >
            <Avatar
                src={otherParticipant.avatar}
                name={otherParticipant.name}
                size="md"
                status={otherParticipant.status}
            />

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-900 truncate">
                        {otherParticipant.name}
                    </span>
                    {lastMessage && (
                        <span className="text-xs text-slate-500 shrink-0">
                            {formatMessageTime(new Date(lastMessage.createdAt))}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between gap-2 mt-0.5">
                    <div className="flex items-center gap-1 min-w-0">
                        {isOwnMessage && lastMessage && (
                            <MessageStatusIcon status={lastMessage.status} />
                        )}
                        <p className="text-sm text-slate-500 truncate">
                            {lastMessage?.content ||
                                (lastMessage?.imageUrl ? 'Photo' : 'No messages yet')}
                        </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                        <UnreadBadge count={conversation.unreadCount} />
                    )}
                </div>
            </div>
        </button>
    );
}
