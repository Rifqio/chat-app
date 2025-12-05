import { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import { MessageSquare } from 'lucide-react'
import { ChatHeader } from './chat-header'
import { ChatSearchPanel } from './chat-search-panel'
import { MessageBubble } from './message-bubble'
import { MessageComposer } from './message-composer'
import { TypingIndicator } from './typing-indicator'
import { useAuthStore, useChatStore } from '@/stores'
import { useWebSocket } from '@/hooks'
import { generateId, cn } from '@/lib/utils'
import type { Message, User } from '@/types'

export function ChatPanel() {
    const { user: currentUser } = useAuthStore()
    const {
        conversations,
        messages,
        activeConversationId,
        typingIndicators,
        toggleDetailPanel,
        addMessage,
    } = useChatStore()
    const { sendMessage, startTyping, stopTyping } = useWebSocket()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const metaAiUser: User = useMemo(
        () => ({
            id: 'meta-ai',
            name: 'Smith AI',
            email: 'smith-ai@example.com',
            avatar:
                'https://api.dicebear.com/7.x/bottts/svg?seed=smith-ai&backgroundColor=ffffff',
            status: 'online',
            createdAt: new Date(),
        }),
        [],
    )
    const [searchState, setSearchState] = useState<{
        isOpen: boolean
        conversationId: string | null
    }>({ isOpen: false, conversationId: null })
    const [highlightedMessageId, setHighlightedMessageId] = useState<
        string | null
    >(null)

    const activeConversation = conversations.find(
        (c) => c.id === activeConversationId,
    )

    const otherParticipant = useMemo(() => {
        if (!activeConversation || !currentUser) return null
        return activeConversation.participants.find(
            (p) => p.id !== currentUser.id,
        )
    }, [activeConversation, currentUser])

    const conversationMessages = useMemo(() => {
        return activeConversationId
            ? messages[activeConversationId] || []
            : []
    }, [activeConversationId, messages])

    const isTyping = typingIndicators.some(
        (t) =>
            t.conversationId === activeConversationId &&
            t.userId === otherParticipant?.id &&
            t.isTyping,
    )

    // Check if search should be shown (only for current conversation)
    const isSearchOpen =
        searchState.isOpen && searchState.conversationId === activeConversationId

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (!isSearchOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [conversationMessages, isTyping, isSearchOpen])

    const handleSendMessage = (content: string, imageUrl?: string) => {
        if (!activeConversationId || !currentUser) return

        const trimmedContent = content.trim()
        const isMetaAiPrompt = /^@smith\s*ai\b/i.test(trimmedContent)
        const promptBody = trimmedContent.replace(/^@smith\s*ai\b[:\s]*/i, '')

        const newMessage: Message = {
            id: generateId(),
            conversationId: activeConversationId,
            senderId: currentUser.id,
            content: trimmedContent,
            imageUrl,
            status: 'sending',
            createdAt: new Date(),
        }

        addMessage(activeConversationId, newMessage)
        sendMessage(activeConversationId, content, imageUrl)

        if (isMetaAiPrompt) {
            const aiReply: Message = {
                id: generateId(),
                conversationId: activeConversationId,
                senderId: metaAiUser.id,
                content:
                    promptBody.length > 0
                        ? `Smith AI (preview): I’m a placeholder for now. You asked: "${promptBody}".`
                        : 'Smith AI (preview): Ask me anything after "@Smith AI".',
                status: 'delivered',
                createdAt: new Date(),
            }

            // Lightweight simulated delay for realism
            setTimeout(() => {
                addMessage(activeConversationId, aiReply)
            }, 450)
        }
    }

    const handleTypingStart = () => {
        if (activeConversationId) {
            startTyping(activeConversationId)
        }
    }

    const handleTypingStop = () => {
        if (activeConversationId) {
            stopTyping(activeConversationId)
        }
    }

    const handleNavigateToMessage = useCallback((messageId: string) => {
        setHighlightedMessageId(messageId)

        // Scroll to message
        const messageElement = document.getElementById(`message-${messageId}`)
        if (messageElement) {
            messageElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        }

        // Clear highlight after animation
        setTimeout(() => {
            setHighlightedMessageId(null)
        }, 2000)
    }, [])

    const handleSearchToggle = () => {
        if (isSearchOpen) {
            setSearchState({ isOpen: false, conversationId: null })
            setHighlightedMessageId(null)
        } else {
            setSearchState({ isOpen: true, conversationId: activeConversationId })
        }
    }

    const handleCloseSearch = () => {
        setSearchState({ isOpen: false, conversationId: null })
        setHighlightedMessageId(null)
    }

    // Empty state - no conversation selected
    if (!activeConversation || !otherParticipant || !currentUser) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50">
                <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <MessageSquare className="h-10 w-10 text-slate-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-700 mb-2">
                    Welcome to Chat
                </h2>
                <p className="text-slate-500 text-center max-w-sm">
                    Select a conversation from the sidebar to start messaging
                </p>
            </div>
        )
    }

    // Group messages to determine when to show avatars
    const groupedMessages = conversationMessages.map((msg, index) => {
        const prevMessage = conversationMessages[index - 1]
        const showAvatar =
            !prevMessage ||
            prevMessage.senderId !== msg.senderId ||
            new Date(msg.createdAt).getTime() -
                new Date(prevMessage.createdAt).getTime() >
                60000 // 1 minute gap
        return { message: msg, showAvatar }
    })

    return (
        <div className="flex-1 flex flex-col h-full bg-white">
            <ChatHeader
                user={otherParticipant}
                isTyping={isTyping}
                isSearchOpen={isSearchOpen}
                onInfoClick={toggleDetailPanel}
                onSearchToggle={handleSearchToggle}
            />

            {/* Search Panel */}
            {isSearchOpen && (
                <ChatSearchPanel
                    messages={conversationMessages}
                    onClose={handleCloseSearch}
                    onNavigateToMessage={handleNavigateToMessage}
                />
            )}

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto py-4 space-y-2 bg-slate-50"
            >
                {conversationMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <p className="text-slate-500 text-sm">
                            No messages yet. Start the conversation!
                        </p>
                    </div>
                ) : (
                    groupedMessages.map(({ message, showAvatar }) => {
                        const sender =
                            message.senderId === currentUser.id
                                ? currentUser
                                : message.senderId === metaAiUser.id
                                  ? metaAiUser
                                  : otherParticipant
                        const isHighlighted =
                            highlightedMessageId === message.id
                        return (
                            <div
                                key={message.id}
                                id={`message-${message.id}`}
                                className={cn(
                                    'transition-all duration-300',
                                    isHighlighted &&
                                        'bg-yellow-100 rounded-lg -mx-2 px-2 py-1',
                                )}
                            >
                                <MessageBubble
                                    message={message}
                                    sender={sender}
                                    isOwn={message.senderId === currentUser.id}
                                    showAvatar={showAvatar}
                                />
                            </div>
                        )
                    })
                )}

                {/* Typing Indicator */}
                {isTyping && otherParticipant && (
                    <TypingIndicator user={otherParticipant} />
                )}

                <div ref={messagesEndRef} />
            </div>

            <MessageComposer
                onSend={handleSendMessage}
                onTypingStart={handleTypingStart}
                onTypingStop={handleTypingStop}
            />
        </div>
    )
}
