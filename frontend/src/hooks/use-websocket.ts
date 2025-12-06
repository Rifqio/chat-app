import { useEffect, useCallback, useRef } from 'react'
import { websocketService } from '@/services'
import { useAuthStore, useChatStore } from '@/stores'
import type { Message, TypingIndicator, User } from '@/types'

export function useWebSocket () {
    const { token, isAuthenticated, user } = useAuthStore()
    const {
        updateUserStatus,
        updateStatusesFromSummary,
        addMessage,
        updateMessageStatus,
        setTypingIndicator,
        upsertUser,
    } = useChatStore()
    const connectedRef = useRef(false)

    useEffect(() => {
        if (!isAuthenticated || !user || connectedRef.current) return

        websocketService.connect(user.id)
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

        const handlePresenceUpdate = ({ userId, status }: { userId: string; status: 'online' | 'offline' }) =>
            updateUserStatus(userId, status)
        const handlePresenceSummary = ({ onlineUsers }: { onlineUsers: string[] }) =>
            updateStatusesFromSummary(onlineUsers)
        const handleUserUpdate = (updatedUser: User) => {
            upsertUser(updatedUser)
        }

        websocketService.on('presence:update', handlePresenceUpdate)
        websocketService.on('presence:summary', handlePresenceSummary)
        websocketService.on('user:online', handleUserOnline)
        websocketService.on('user:offline', handleUserOffline)
        websocketService.on('message:new', handleNewMessage)
        websocketService.on('message:delivered', handleMessageDelivered)
        websocketService.on('message:read', handleMessageRead)
        websocketService.on('typing:start', handleTypingStart)
        websocketService.on('typing:stop', handleTypingStop)
        websocketService.on('user:update', handleUserUpdate)

        return () => {
            websocketService.off('presence:update', handlePresenceUpdate)
            websocketService.off('presence:summary', handlePresenceSummary)
            websocketService.off('user:online', handleUserOnline)
            websocketService.off('user:offline', handleUserOffline)
            websocketService.off('message:new', handleNewMessage)
            websocketService.off('message:delivered', handleMessageDelivered)
            websocketService.off('message:read', handleMessageRead)
            websocketService.off('typing:start', handleTypingStart)
            websocketService.off('typing:stop', handleTypingStop)
            websocketService.off('user:update', handleUserUpdate)
            websocketService.disconnect()
            connectedRef.current = false
        }
    }, [
        isAuthenticated,
        token,
        user,
        updateUserStatus,
        addMessage,
        updateMessageStatus,
        setTypingIndicator,
        updateStatusesFromSummary,
        upsertUser,
    ])

    const sendMessage = useCallback(
        (
            conversationId: string,
            content: string,
            mediaKey?: string,
            mediaMimeType?: string,
        ) => {
            websocketService.sendMessage(conversationId, content, mediaKey, mediaMimeType)
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
