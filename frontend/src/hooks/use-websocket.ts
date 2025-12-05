import { useEffect, useCallback, useRef } from 'react'
import { websocketService } from '@/services'
import { useAuthStore, useChatStore } from '@/stores'
import type { Message, TypingIndicator, User } from '@/types'

export function useWebSocket () {
    const { token, isAuthenticated } = useAuthStore()
    const {
        updateUserStatus,
        addMessage,
        updateMessageStatus,
        setTypingIndicator,
    } = useChatStore()
    const connectedRef = useRef(false)

    useEffect(() => {
        if (!isAuthenticated || !token || connectedRef.current) return

        websocketService.connect(token)
        connectedRef.current = true

        const handleUserOnline = (user: User) => {
            updateUserStatus(user.id, 'online')
        }

        const handleUserOffline = (userId: string) => {
            updateUserStatus(userId, 'offline')
        }

        const handleNewMessage = (message: Message) => {
            addMessage(message.conversationId, message)
        }

        const handleMessageDelivered = ({
            messageId,
            conversationId,
        }: {
            messageId: string
            conversationId: string
        }) => {
            updateMessageStatus(conversationId, messageId, 'delivered')
        }

        const handleMessageRead = ({
            messageId,
            conversationId,
        }: {
            messageId: string
            conversationId: string
        }) => {
            updateMessageStatus(conversationId, messageId, 'read')
        }

        const handleTypingStart = (indicator: TypingIndicator) => {
            setTypingIndicator({ ...indicator, isTyping: true })
        }

        const handleTypingStop = (indicator: TypingIndicator) => {
            setTypingIndicator({ ...indicator, isTyping: false })
        }

        websocketService.on('user:online', handleUserOnline)
        websocketService.on('user:offline', handleUserOffline)
        websocketService.on('message:new', handleNewMessage)
        websocketService.on('message:delivered', handleMessageDelivered)
        websocketService.on('message:read', handleMessageRead)
        websocketService.on('typing:start', handleTypingStart)
        websocketService.on('typing:stop', handleTypingStop)

        return () => {
            websocketService.off('user:online', handleUserOnline)
            websocketService.off('user:offline', handleUserOffline)
            websocketService.off('message:new', handleNewMessage)
            websocketService.off('message:delivered', handleMessageDelivered)
            websocketService.off('message:read', handleMessageRead)
            websocketService.off('typing:start', handleTypingStart)
            websocketService.off('typing:stop', handleTypingStop)
            websocketService.disconnect()
            connectedRef.current = false
        }
    }, [
        isAuthenticated,
        token,
        updateUserStatus,
        addMessage,
        updateMessageStatus,
        setTypingIndicator,
    ])

    const sendMessage = useCallback(
        (conversationId: string, content: string, imageUrl?: string) => {
            websocketService.sendMessage(conversationId, content, imageUrl)
        },
        [],
    )

    const startTyping = useCallback((conversationId: string) => {
        websocketService.startTyping(conversationId)
    }, [])

    const stopTyping = useCallback((conversationId: string) => {
        websocketService.stopTyping(conversationId)
    }, [])

    const markAsRead = useCallback(
        (conversationId: string, messageId: string) => {
            websocketService.markAsRead(conversationId, messageId)
        },
        [],
    )

    return {
        sendMessage,
        startTyping,
        stopTyping,
        markAsRead,
        isConnected: websocketService.isConnected,
    }
}
