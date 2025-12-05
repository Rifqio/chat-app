import type {
    User,
    Conversation,
    Message,
    LoginCredentials,
    RegisterCredentials,
} from '@/types'
import {
    mockUsers,
    mockConversations,
    mockMessages,
    DEMO_CREDENTIALS,
} from '@/mocks'
import { generateId } from '@/lib/utils'

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// In-memory storage for mock data (arrays/objects mutated in place)
const users = [...mockUsers]
const conversations = [...mockConversations]
const messages: Record<string, Message[]> = { ...mockMessages }
let currentUser: User | null = null

export const mockAuthApi = {
    login: async (
        credentials: LoginCredentials,
    ): Promise<{ user: User; token: string }> => {
        await delay(800)

        // Check demo credentials
        if (
            credentials.email === DEMO_CREDENTIALS.email &&
            credentials.password === DEMO_CREDENTIALS.password
        ) {
            const user = users.find((u) => u.email === DEMO_CREDENTIALS.email)
            if (user) {
                currentUser = { ...user, status: 'online' }
                return {
                    user: currentUser,
                    token: `mock-jwt-token-${user.id}`,
                }
            }
        }

        // Check if user exists (for registered users)
        const user = users.find((u) => u.email === credentials.email)
        if (user) {
            currentUser = { ...user, status: 'online' }
            return {
                user: currentUser,
                token: `mock-jwt-token-${user.id}`,
            }
        }

        throw new Error('Invalid email or password')
    },

    register: async (
        credentials: RegisterCredentials,
    ): Promise<{ user: User; token: string }> => {
        await delay(800)

        // Check if email already exists
        if (users.some((u) => u.email === credentials.email)) {
            throw new Error('Email already registered')
        }

        const newUser: User = {
            id: generateId(),
            email: credentials.email,
            name: credentials.name,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.email}`,
            status: 'online',
            createdAt: new Date(),
        }

        users.push(newUser)
        currentUser = newUser

        return {
            user: newUser,
            token: `mock-jwt-token-${newUser.id}`,
        }
    },

    me: async (): Promise<User> => {
        await delay(300)
        if (!currentUser) {
            throw new Error('Not authenticated')
        }
        return currentUser
    },

    logout: async (): Promise<void> => {
        await delay(300)
        currentUser = null
    },
}

export const mockUsersApi = {
    getAll: async (): Promise<User[]> => {
        await delay(500)
        return users
    },

    getById: async (id: string): Promise<User> => {
        await delay(300)
        const user = users.find((u) => u.id === id)
        if (!user) throw new Error('User not found')
        return user
    },
}

export const mockConversationsApi = {
    getAll: async (): Promise<Conversation[]> => {
        await delay(500)
        return conversations.filter((c) =>
            c.participants.some((p) => p.id === currentUser?.id),
        )
    },

    getById: async (id: string): Promise<Conversation> => {
        await delay(300)
        const conv = conversations.find((c) => c.id === id)
        if (!conv) throw new Error('Conversation not found')
        return conv
    },

    create: async (participantId: string): Promise<Conversation> => {
        await delay(500)
        if (!currentUser) throw new Error('Not authenticated')

        const participant = users.find((u) => u.id === participantId)
        if (!participant) throw new Error('User not found')

        const newConversation: Conversation = {
            id: generateId(),
            participants: [currentUser, participant],
            unreadCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        conversations.push(newConversation)
        messages[newConversation.id] = []

        return newConversation
    },

    getOrCreate: async (participantId: string): Promise<Conversation> => {
        await delay(500)
        if (!currentUser) throw new Error('Not authenticated')

        // Check if conversation exists
        const existing = conversations.find(
            (c) =>
                c.participants.some((p) => p.id === currentUser?.id) &&
                c.participants.some((p) => p.id === participantId),
        )

        if (existing) return existing

        return mockConversationsApi.create(participantId)
    },
}

export const mockMessagesApi = {
    getByConversation: async (
        conversationId: string,
    ): Promise<{ messages: Message[]; hasMore: boolean }> => {
        await delay(400)
        return {
            messages: messages[conversationId] || [],
            hasMore: false,
        }
    },

    send: async (
        conversationId: string,
        content: string,
        imageUrl?: string,
    ): Promise<Message> => {
        await delay(300)
        if (!currentUser) throw new Error('Not authenticated')

        const newMessage: Message = {
            id: generateId(),
            conversationId,
            senderId: currentUser.id,
            content,
            imageUrl,
            status: 'sent',
            createdAt: new Date(),
        }

        if (!messages[conversationId]) {
            messages[conversationId] = []
        }
        messages[conversationId].push(newMessage)

        // Update conversation
        const conv = conversations.find((c) => c.id === conversationId)
        if (conv) {
            conv.lastMessage = newMessage
            conv.updatedAt = new Date()
        }

        // Simulate status updates
        setTimeout(() => {
            newMessage.status = 'delivered'
        }, 500)

        setTimeout(() => {
            newMessage.status = 'read'
        }, 1500)

        return newMessage
    },
}

export const mockApi = {
    auth: mockAuthApi,
    users: mockUsersApi,
    conversations: mockConversationsApi,
    messages: mockMessagesApi,
}
