import { Search, Info, X } from 'lucide-react'
import { Avatar, Button } from '@/components/ui'
import type { User } from '@/types'

interface ChatHeaderProps {
    user: User
    isTyping: boolean
    isSearchOpen: boolean
    onInfoClick: () => void
    onSearchToggle: () => void
}

export function ChatHeader({
    user,
    isTyping,
    isSearchOpen,
    onInfoClick,
    onSearchToggle,
}: ChatHeaderProps) {
    return (
        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-3">
                <Avatar
                    src={user.avatar}
                    name={user.name}
                    size="md"
                    status={user.status}
                    onClick={onInfoClick}
                    className="cursor-pointer"
                />
                <div>
                    <h2 className="font-semibold text-slate-900">{user.name}</h2>
                    <p className="text-xs text-slate-500">
                        {isTyping ? (
                            <span className="text-emerald-500">typing...</span>
                        ) : user.status === 'online' ? (
                            'Online'
                        ) : (
                            'Offline'
                        )}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-1">
                <Button
                    variant={isSearchOpen ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={onSearchToggle}
                    aria-label="Search in conversation"
                >
                    {isSearchOpen ? (
                        <X className="h-5 w-5 text-slate-500" />
                    ) : (
                        <Search className="h-5 w-5 text-slate-500" />
                    )}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onInfoClick}
                    aria-label="User info"
                >
                    <Info className="h-5 w-5 text-slate-500" />
                </Button>
            </div>
        </header>
    )
}
