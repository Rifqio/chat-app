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
    upsertConversation: (conversation: Conversation) => void
    upsertUser: (user: User) => void
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
    updateStatusesFromSummary: (onlineIds: string[]) => void
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
    updateStatusesFromSummary: (onlineIds) =>
        set((state) => {
            const onlineSet = new Set(onlineIds)
            return {
                users: state.users.map((user) => ({
                    ...user,
                    status: onlineSet.has(user.id) ? 'online' : 'offline',
                })),
            }
        }),

    setConversations: (conversations) => set({ conversations }),

    upsertConversation: (conversation) =>
        set((state) => {
            const exists = state.conversations.some(
                (c) => c.id === conversation.id,
            )
            const updated = exists
                ? state.conversations.map((c) =>
                      c.id === conversation.id ? conversation : c,
                  )
                : [...state.conversations, conversation]

            const sorted = [...updated].sort(
                (a, b) =>
                    new Date(b.updatedAt).getTime() -
                    new Date(a.updatedAt).getTime(),
            )

            return { conversations: sorted }
        }),

    upsertUser: (user) =>
        set((state) => {
            const users = state.users.some((u) => u.id === user.id)
                ? state.users.map((u) => (u.id === user.id ? user : u))
                : [...state.users, user]

            const conversations = state.conversations.map((conv) => ({
                ...conv,
                participants: conv.participants.map((p) =>
                    p.id === user.id ? { ...p, ...user } : p,
                ),
            }))

            return { users, conversations }
        }),

    setActiveConversation: (conversationId) =>
        set({ activeConversationId: conversationId }),

    addMessage: (conversationId, message) =>
        set((state) => {
            const existing = state.messages[conversationId] || []

            // Deduplicate by id
            const idIndex = existing.findIndex((m) => m.id === message.id)

            // Or replace optimistic sending with same sender/content
            const optimisticIndex =
                idIndex === -1
                    ? existing.findIndex(
                          (m) =>
                              m.status === 'sending' &&
                              m.senderId === message.senderId &&
                              m.content === message.content,
                      )
                    : -1

            let nextMessages: typeof existing
            if (idIndex >= 0) {
                nextMessages = [...existing]
                nextMessages[idIndex] = message
            } else if (optimisticIndex >= 0) {
                nextMessages = [...existing]
                nextMessages[optimisticIndex] = message
            } else {
                nextMessages = [...existing, message]
            }

            const conversations = state.conversations
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
                )

            return {
                messages: {
                    ...state.messages,
                    [conversationId]: nextMessages,
                },
                conversations,
            }
        }),

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
