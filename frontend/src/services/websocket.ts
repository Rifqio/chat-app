import { io, Socket } from 'socket.io-client'
import type { Message, TypingIndicator, User } from '@/types'

type WebSocketEvents = {
    connect: () => void
    disconnect: () => void
    'user:online': (user: User) => void
    'user:offline': (userId: string) => void
    'message:new': (message: Message) => void
    'message:delivered': (data: {
        messageId: string
        conversationId: string
    }) => void
    'message:read': (data: {
        messageId: string
        conversationId: string
    }) => void
    'typing:start': (indicator: TypingIndicator) => void
    'typing:stop': (indicator: TypingIndicator) => void
    error: (error: Error) => void
}

class WebSocketService {
    private socket: Socket | null = null
    private listeners: Map<string, Set<(...args: unknown[]) => void>> =
        new Map()

    connect (
        token: string,
        serverUrl: string = import.meta.env.VITE_WS_URL ||
            'http://localhost:3001',
    ) {
        if (this.socket?.connected) {
            return
        }

        this.socket = io(serverUrl, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        })

        this.socket.on('connect', () => {
            console.log('WebSocket connected')
            this.emit('connect')
        })

        this.socket.on('disconnect', () => {
            console.log('WebSocket disconnected')
            this.emit('disconnect')
        })

        this.socket.on('error', (error) => {
            console.error('WebSocket error:', error)
            this.emit('error', error)
        })

        // Forward all events to registered listeners
        const events = [
            'user:online',
            'user:offline',
            'message:new',
            'message:delivered',
            'message:read',
            'typing:start',
            'typing:stop',
        ]

        events.forEach((event) => {
            this.socket?.on(event, (data) => {
                this.emit(event, data)
            })
        })
    }

    disconnect () {
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
        }
        this.listeners.clear()
    }

    on<K extends keyof WebSocketEvents> (
        event: K,
        callback: WebSocketEvents[K],
    ) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set())
        }
        this.listeners.get(event)!.add(callback as (...args: unknown[]) => void)
    }

    off<K extends keyof WebSocketEvents> (
        event: K,
        callback: WebSocketEvents[K],
    ) {
        this.listeners
            .get(event)
            ?.delete(callback as (...args: unknown[]) => void)
    }

    private emit (event: string, ...args: unknown[]) {
        this.listeners.get(event)?.forEach((callback) => callback(...args))
    }

    sendMessage (conversationId: string, content: string, imageUrl?: string) {
        this.socket?.emit('message:send', { conversationId, content, imageUrl })
    }

    markAsDelivered (conversationId: string, messageId: string) {
        this.socket?.emit('message:delivered', { conversationId, messageId })
    }

    markAsRead (conversationId: string, messageId: string) {
        this.socket?.emit('message:read', { conversationId, messageId })
    }

    startTyping (conversationId: string) {
        this.socket?.emit('typing:start', { conversationId })
    }

    stopTyping (conversationId: string) {
        this.socket?.emit('typing:stop', { conversationId })
    }

    isConnected (): boolean {
        return this.socket?.connected ?? false
    }
}

export const websocketService = new WebSocketService()
