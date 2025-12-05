import { useEffect, useRef } from 'react'
import { Sidebar, ChatPanel, DetailPanel } from '@/features/chat'
import { useWebSocket } from '@/hooks'
import { useAuthStore, useChatStore } from '@/stores'
import { mockConversations, mockMessages, mockUsers } from '@/mocks'

export function ChatLayout() {
    useWebSocket()

    const { user } = useAuthStore()
    const { conversations, setUsers, setConversations, setMessages } = useChatStore()
    const dataLoadedRef = useRef(false)

    // TODO: Change to use API calls when they are implemented
    useEffect(() => {
        if (user && conversations.length === 0 && !dataLoadedRef.current) {
            dataLoadedRef.current = true
            setUsers(mockUsers)
            setConversations(mockConversations)
            Object.entries(mockMessages).forEach(([convId, msgs]) => {
                setMessages(convId, msgs)
            })
        }
    }, [user, conversations.length, setUsers, setConversations, setMessages])

    return (
        <div className="h-screen flex bg-white overflow-hidden">
            <Sidebar />
            <ChatPanel />
            <DetailPanel />
        </div>
    )
}
