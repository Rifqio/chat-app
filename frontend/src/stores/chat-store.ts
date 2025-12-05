import { create } from 'zustand'
import type { User, Message, Conversation, TypingIndicator } from '@/types'

interface ChatStore {
    users: User[]
    conversations: Conversation[]
    messages: Record<string, Message[]>
    activeConversationId: string | null
    typingIndicators: TypingIndicator[]
    isDetailPanelOpen: boolean

    setUsers: (users: User[]) => void
    updateUserStatus: (userId: string, status: User['status']) => void
    setConversations: (conversations: Conversation[]) => void
    setActiveConversation: (conversationId: string | null) => void
    addMessage: (conversationId: string, message: Message) => void
    setMessages: (conversationId: string, messages: Message[]) => void
    updateMessageStatus: (
        conversationId: string,
        messageId: string,
        status: Message['status'],
    ) => void
    setTypingIndicator: (indicator: TypingIndicator) => void
    clearTypingIndicator: (conversationId: string, userId: string) => void
    toggleDetailPanel: () => void
    setDetailPanelOpen: (open: boolean) => void
    markConversationAsRead: (conversationId: string) => void
    getActiveConversation: () => Conversation | undefined
    getOtherParticipant: (
        conversation: Conversation,
        currentUserId: string,
    ) => User | undefined
    resetStore: () => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
    users: [],
    conversations: [],
    messages: {},
    activeConversationId: null,
    typingIndicators: [],
    isDetailPanelOpen: false,

    setUsers: (users) => set({ users }),

    updateUserStatus: (userId, status) =>
        set((state) => ({
            users: state.users.map((user) =>
                user.id === userId ? { ...user, status } : user,
            ),
        })),

    setConversations: (conversations) => set({ conversations }),

    setActiveConversation: (conversationId) =>
        set({ activeConversationId: conversationId }),

    addMessage: (conversationId, message) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [conversationId]: [
                    ...(state.messages[conversationId] || []),
                    message,
                ],
            },
            conversations: state.conversations
                .map((conv) =>
                    conv.id === conversationId
                        ? {
                              ...conv,
                              lastMessage: message,
                              updatedAt: new Date(),
                          }
                        : conv,
                )
                .sort(
                    (a, b) =>
                        new Date(b.updatedAt).getTime() -
                        new Date(a.updatedAt).getTime(),
                ),
        })),

    setMessages: (conversationId, messages) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [conversationId]: messages,
            },
        })),

    updateMessageStatus: (conversationId, messageId, status) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [conversationId]: (state.messages[conversationId] || []).map(
                    (msg) => (msg.id === messageId ? { ...msg, status } : msg),
                ),
            },
        })),

    setTypingIndicator: (indicator) =>
        set((state) => {
            const filtered = state.typingIndicators.filter(
                (t) =>
                    !(
                        t.conversationId === indicator.conversationId &&
                        t.userId === indicator.userId
                    ),
            )
            return {
                typingIndicators: indicator.isTyping
                    ? [...filtered, indicator]
                    : filtered,
            }
        }),

    clearTypingIndicator: (conversationId, userId) =>
        set((state) => ({
            typingIndicators: state.typingIndicators.filter(
                (t) =>
                    !(
                        t.conversationId === conversationId &&
                        t.userId === userId
                    ),
            ),
        })),

    toggleDetailPanel: () =>
        set((state) => ({ isDetailPanelOpen: !state.isDetailPanelOpen })),

    setDetailPanelOpen: (open) => set({ isDetailPanelOpen: open }),

    markConversationAsRead: (conversationId) =>
        set((state) => ({
            conversations: state.conversations.map((conv) =>
                conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv,
            ),
        })),

    getActiveConversation: () => {
        const state = get()
        return state.conversations.find(
            (conv) => conv.id === state.activeConversationId,
        )
    },

    getOtherParticipant: (conversation, currentUserId) => {
        return conversation.participants.find((p) => p.id !== currentUserId)
    },

    resetStore: () =>
        set({
            users: [],
            conversations: [],
            messages: {},
            activeConversationId: null,
            typingIndicators: [],
            isDetailPanelOpen: false,
        }),
}))
