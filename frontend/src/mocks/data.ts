import type { User, Conversation, Message } from '@/types'

// Mock users for development without backend
export const mockUsers: User[] = [
    {
        id: 'user-1',
        email: 'demo@example.com',
        name: 'Demo User',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
        status: 'online',
        createdAt: new Date('2024-01-01'),
    },
    {
        id: 'user-2',
        email: 'alice@example.com',
        name: 'Alice Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
        status: 'online',
        createdAt: new Date('2024-01-02'),
    },
    {
        id: 'user-3',
        email: 'bob@example.com',
        name: 'Bob Smith',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
        status: 'offline',
        lastSeen: new Date('2024-12-03T10:30:00'),
        createdAt: new Date('2024-01-03'),
    },
    {
        id: 'user-4',
        email: 'charlie@example.com',
        name: 'Charlie Brown',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
        status: 'online',
        createdAt: new Date('2024-01-04'),
    },
    {
        id: 'user-5',
        email: 'diana@example.com',
        name: 'Diana Prince',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana',
        status: 'away',
        lastSeen: new Date('2024-12-03T14:00:00'),
        createdAt: new Date('2024-01-05'),
    },
]

// Helper to get mock user by ID
export function getMockUserById (id: string): User | undefined {
    return mockUsers.find((u) => u.id === id)
}

// Mock conversations
export const mockConversations: Conversation[] = [
    {
        id: 'conv-1',
        participants: [mockUsers[0], mockUsers[1]],
        lastMessage: {
            id: 'msg-1-5',
            conversationId: 'conv-1',
            senderId: 'user-2',
            content: 'That sounds great! Let me know when you are free.',
            status: 'delivered',
            createdAt: new Date('2024-12-04T09:15:00'),
        },
        unreadCount: 2,
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-04T09:15:00'),
    },
    {
        id: 'conv-2',
        participants: [mockUsers[0], mockUsers[2]],
        lastMessage: {
            id: 'msg-2-3',
            conversationId: 'conv-2',
            senderId: 'user-1',
            content: 'See you tomorrow!',
            status: 'read',
            createdAt: new Date('2024-12-03T18:30:00'),
        },
        unreadCount: 0,
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-03T18:30:00'),
    },
    {
        id: 'conv-3',
        participants: [mockUsers[0], mockUsers[3]],
        lastMessage: {
            id: 'msg-3-1',
            conversationId: 'conv-3',
            senderId: 'user-4',
            content: 'Hey! How is the project going?',
            status: 'delivered',
            createdAt: new Date('2024-12-03T12:00:00'),
        },
        unreadCount: 1,
        createdAt: new Date('2024-12-02'),
        updatedAt: new Date('2024-12-03T12:00:00'),
    },
    {
        id: 'conv-4',
        participants: [mockUsers[0], mockUsers[4]],
        lastMessage: undefined,
        unreadCount: 0,
        createdAt: new Date('2024-12-03'),
        updatedAt: new Date('2024-12-03'),
    },
]

// Mock messages for conversations
export const mockMessages: Record<string, Message[]> = {
    'conv-1': [
        {
            id: 'msg-1-1',
            conversationId: 'conv-1',
            senderId: 'user-1',
            content: 'Hey Alice! How are you doing?',
            status: 'read',
            createdAt: new Date('2024-12-04T09:00:00'),
        },
        {
            id: 'msg-1-2',
            conversationId: 'conv-1',
            senderId: 'user-2',
            content: 'Hi! I am doing great, thanks for asking! 😊',
            status: 'read',
            createdAt: new Date('2024-12-04T09:02:00'),
        },
        {
            id: 'msg-1-3',
            conversationId: 'conv-1',
            senderId: 'user-1',
            content: 'Would you like to grab coffee sometime this week?',
            status: 'read',
            createdAt: new Date('2024-12-04T09:05:00'),
        },
        {
            id: 'msg-1-4',
            conversationId: 'conv-1',
            senderId: 'user-2',
            content: 'Sure! That would be lovely.',
            status: 'read',
            createdAt: new Date('2024-12-04T09:10:00'),
        },
        {
            id: 'msg-1-5',
            conversationId: 'conv-1',
            senderId: 'user-2',
            content: 'That sounds great! Let me know when you are free.',
            status: 'delivered',
            createdAt: new Date('2024-12-04T09:15:00'),
        },
    ],
    'conv-2': [
        {
            id: 'msg-2-1',
            conversationId: 'conv-2',
            senderId: 'user-3',
            content: 'Did you finish the report?',
            status: 'read',
            createdAt: new Date('2024-12-03T17:00:00'),
        },
        {
            id: 'msg-2-2',
            conversationId: 'conv-2',
            senderId: 'user-1',
            content: 'Yes, I just submitted it. Should be in your inbox now.',
            status: 'read',
            createdAt: new Date('2024-12-03T17:30:00'),
        },
        {
            id: 'msg-2-3',
            conversationId: 'conv-2',
            senderId: 'user-1',
            content: 'See you tomorrow!',
            status: 'read',
            createdAt: new Date('2024-12-03T18:30:00'),
        },
    ],
    'conv-3': [
        {
            id: 'msg-3-1',
            conversationId: 'conv-3',
            senderId: 'user-4',
            content: 'Hey! How is the project going?',
            status: 'delivered',
            createdAt: new Date('2024-12-03T12:00:00'),
        },
    ],
    'conv-4': [],
}

// Demo credentials for mock login
export const DEMO_CREDENTIALS = {
    email: 'demo@example.com',
    password: 'Demo123!',
}
