import { useEffect, useRef } from 'react'
import { Sidebar, ChatPanel, DetailPanel } from '@/features/chat'
import { useWebSocket } from '@/hooks'
import { useAuthStore, useChatStore } from '@/stores'
import { api } from '@/services'

export function ChatLayout() {
    useWebSocket()

    const { user } = useAuthStore()
    const { setUsers, setConversations } = useChatStore()
    const dataLoadedRef = useRef(false)

    useEffect(() => {
        const load = async () => {
            if (!user || dataLoadedRef.current) return
            dataLoadedRef.current = true
            try {
                const [fetchedUsers, fetchedConversations] = await Promise.all([
                    api.users.getAll(),
                    api.conversations.getAll(),
                ])
                setUsers(fetchedUsers)
                setConversations(fetchedConversations)
            } catch (error) {
                console.error('Failed to load initial data', error)
            }
        }
        load()
    }, [user, setUsers, setConversations])

    return (
        <div className="h-screen flex bg-white overflow-hidden">
            <Sidebar />
            <ChatPanel />
            <DetailPanel />
        </div>
    )
}
