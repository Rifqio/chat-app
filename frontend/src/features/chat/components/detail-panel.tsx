import { X, ImageIcon } from 'lucide-react';
import { Avatar, Button } from '@/components/ui';
import { useAuthStore, useChatStore } from '@/stores';
import { useMemo } from 'react';

export function DetailPanel() {
    const { user: currentUser } = useAuthStore();
    const {
        conversations,
        messages,
        activeConversationId,
        isDetailPanelOpen,
        setDetailPanelOpen,
    } = useChatStore();

    const activeConversation = conversations.find(
        (c) => c.id === activeConversationId,
    );

    const otherParticipant = useMemo(() => {
        if (!activeConversation || !currentUser) return null;
        return activeConversation.participants.find(
            (p) => p.id !== currentUser.id,
        );
    }, [activeConversation, currentUser]);

    // Filter photos from messages
    const photoItems = useMemo(() => {
        const conversationMessages = activeConversationId
            ? messages[activeConversationId] || []
            : [];
        return conversationMessages
            .filter((msg) => msg.imageUrl)
            .map((msg) => msg.imageUrl!);
    }, [activeConversationId, messages]);

    if (!isDetailPanelOpen || !otherParticipant) return null;

    return (
        <aside className="w-80 border-l border-slate-200 bg-white flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                <h2 className="font-semibold text-slate-900">Details</h2>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDetailPanelOpen(false)}
                    aria-label="Close panel"
                >
                    <X className="h-5 w-5 text-slate-500" />
                </Button>
            </div>

            {/* Profile Section */}
            <div className="flex flex-col items-center py-6 px-4 border-b border-slate-200">
                <Avatar
                    src={otherParticipant.avatar}
                    name={otherParticipant.name}
                    size="xl"
                    status={otherParticipant.status}
                />
                <h3 className="mt-4 font-semibold text-lg text-slate-900">
                    {otherParticipant.name}
                </h3>
                <p className="text-sm text-slate-500">
                    {otherParticipant.status === 'online'
                        ? 'Online'
                        : 'Offline'}
                </p>
            </div>

            {/* About Section */}
            <div className="px-4 py-4 border-b border-slate-200">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    About
                </h4>
                <p className="text-sm text-slate-700">
                    {otherParticipant.about?.trim()
                        ? otherParticipant.about
                        : 'No about set yet.'}
                </p>
            </div>

            {/* Photos Section */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200">
                    <ImageIcon className="h-4 w-4 text-slate-900" />
                    <h4 className="text-sm font-medium text-slate-900">
                        Photos
                    </h4>
                    <span className="text-xs text-slate-500">
                        ({photoItems.length})
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {photoItems.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                            {photoItems.map((url, index) => (
                                <button
                                    key={index}
                                    onClick={() => window.open(url, '_blank')}
                                    className="aspect-square rounded-lg overflow-hidden bg-slate-100 hover:opacity-80 transition-opacity"
                                >
                                    <img
                                        src={url}
                                        alt={`Photo ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                <ImageIcon className="h-6 w-6 text-slate-400" />
                            </div>
                            <p className="text-sm text-slate-500">
                                No photos shared yet
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
