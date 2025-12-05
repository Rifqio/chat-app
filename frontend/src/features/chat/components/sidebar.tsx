import { Search, Settings, LogOut } from 'lucide-react'
import { Avatar, Input, Button } from '@/components/ui'
import { UserListItem } from './user-list-item'
import { ProfileSettingsModal } from '@/components/profile-settings-modal'
import { useAuthStore, useChatStore } from '@/stores'
import { useNavigate } from 'react-router'
import { useState } from 'react'

export function Sidebar() {
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()
    const {
        conversations,
        activeConversationId,
        setActiveConversation,
        resetStore,
    } = useChatStore()
    const [searchQuery, setSearchQuery] = useState('')
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    if (!user) return null

    const filteredConversations = conversations.filter((conv) => {
        const otherParticipant = conv.participants.find(
            (p) => p.id !== user.id,
        )
        return otherParticipant?.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    })

    const handleLogout = () => {
        resetStore()
        logout()
        navigate('/auth')
    }

    return (
        <>
            <aside className="flex flex-col h-full w-80 border-r border-slate-200 bg-white">
                {/* Search */}
                <div className="p-4 border-b border-slate-200">
                    <Input
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        leftIcon={<Search className="h-4 w-4" />}
                        className="bg-slate-50"
                    />
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                <Search className="h-8 w-8 text-slate-400" />
                            </div>
                            <p className="text-slate-500 text-sm">
                                {searchQuery
                                    ? 'No conversations found'
                                    : 'No conversations yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredConversations.map((conversation) => (
                                <UserListItem
                                    key={conversation.id}
                                    conversation={conversation}
                                    currentUser={user}
                                    isActive={
                                        conversation.id === activeConversationId
                                    }
                                    onClick={() =>
                                        setActiveConversation(conversation.id)
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Account actions */}
                <div className="p-4 border-t border-slate-200 space-y-3 bg-white">
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                        <div className="flex items-center gap-3">
                            <Avatar
                                src={user.avatar}
                                name={user.name}
                                size="sm"
                                status={user.status}
                            />
                            <div>
                                <p className="text-sm font-semibold text-slate-900">
                                    {user.name}
                                </p>
                                <p className="text-xs text-slate-500 capitalize">
                                    {user.status} • My Account
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => setIsSettingsOpen(true)}
                            aria-label="Manage account"
                        >
                            <Settings className="h-4 w-4" />
                        </Button>
                    </div>

                    <Button
                        variant="danger"
                        className="w-full"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            <ProfileSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </>
    )
}
