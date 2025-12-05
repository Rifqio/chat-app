import { Avatar } from '@/components/ui';
import { cn, formatMessageTime } from '@/lib/utils';
import type { Message, User, MessageStatus } from '@/types';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
    message: Message;
    sender: User;
    isOwn: boolean;
    showAvatar: boolean;
}

function MessageStatusIcon({ status }: { status: MessageStatus }) {
    switch (status) {
        case 'sending':
            return (
                <div className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin opacity-60" />
            );
        case 'sent':
            return <Check className="h-3.5 w-3.5 opacity-60" />;
        case 'delivered':
            return <CheckCheck className="h-3.5 w-3.5 opacity-60" />;
        case 'read':
            return <CheckCheck className="h-3.5 w-3.5 text-slate-600" />;
        default:
            return null;
    }
}

export function MessageBubble({
    message,
    sender,
    isOwn,
    showAvatar,
}: MessageBubbleProps) {
    const renderContent = (text: string) => {
        const mentionRegex = /@smith\s+ai/gi
        return text.split(mentionRegex).reduce<React.ReactNode[]>((acc, part, idx, arr) => {
            acc.push(part)
            if (idx < arr.length - 1) {
                acc.push(
                    <span key={`mention-${idx}`} className="text-blue-600 font-semibold">
                        @Smith AI
                    </span>,
                )
            }
            return acc
        }, [])
    }

    return (
        <div
            className={cn(
                'flex gap-2 px-4',
                isOwn ? 'flex-row-reverse' : 'flex-row',
            )}
        >
            {/* Avatar placeholder for alignment */}
            <div className="w-8 shrink-0">
                {showAvatar && !isOwn && (
                    <Avatar src={sender.avatar} name={sender.name} size="sm" />
                )}
            </div>

            <div
                className={cn(
                    'flex flex-col max-w-[70%]',
                    isOwn ? 'items-end' : 'items-start',
                )}
            >
                {sender.id === 'meta-ai' && (
                    <span className="mb-1 text-xs font-semibold text-slate-500">
                        {sender.name}
                    </span>
                )}
                {/* Message content */}
                <div
                    className={cn(
                        'px-4 py-2.5 rounded-2xl',
                        isOwn
                            ? 'bg-slate-900 text-white rounded-br-md'
                            : 'bg-slate-100 text-slate-900 rounded-bl-md',
                    )}
                >
                    {message.imageUrl && (
                        <img
                            src={message.imageUrl}
                            alt="Attachment"
                            className="rounded-lg max-w-full mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() =>
                                window.open(message.imageUrl, '_blank')
                            }
                        />
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">
                        {renderContent(message.content)}
                    </p>
                </div>

                {/* Timestamp and status */}
                <div
                    className={cn(
                        'flex items-center gap-1 mt-1 text-xs text-slate-400',
                        isOwn ? 'flex-row-reverse' : 'flex-row',
                    )}
                >
                    <span>
                        {formatMessageTime(new Date(message.createdAt))}
                    </span>
                    {isOwn && <MessageStatusIcon status={message.status} />}
                </div>
            </div>
        </div>
    );
}
