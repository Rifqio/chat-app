import { useState, useMemo, useEffect, useRef } from 'react'
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react'
import { Input, Button } from '@/components/ui'
import type { Message } from '@/types'

interface ChatSearchPanelProps {
    messages: Message[]
    onClose: () => void
    onNavigateToMessage: (messageId: string) => void
}

export function ChatSearchPanel({
    messages,
    onClose,
    onNavigateToMessage,
}: ChatSearchPanelProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [currentIndex, setCurrentIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return []
        const query = searchQuery.toLowerCase()
        return messages.filter((msg) =>
            msg.content.toLowerCase().includes(query),
        )
    }, [searchQuery, messages])

    const resultCount = searchResults.length

    // Navigate to current result
    useEffect(() => {
        if (searchResults.length > 0 && currentIndex < searchResults.length) {
            onNavigateToMessage(searchResults[currentIndex].id)
        }
    }, [currentIndex, searchResults, onNavigateToMessage])

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
        }
    }

    const handleNext = () => {
        if (currentIndex < resultCount - 1) {
            setCurrentIndex(currentIndex + 1)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            if (e.shiftKey) {
                handlePrevious()
            } else {
                handleNext()
            }
        } else if (e.key === 'Escape') {
            onClose()
        }
    }

    return (
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                    <Input
                        ref={inputRef}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setCurrentIndex(0)
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Search messages..."
                        leftIcon={<Search className="h-4 w-4" />}
                        className="bg-white pr-24"
                    />
                    {searchQuery && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                            {resultCount > 0
                                ? `${currentIndex + 1} of ${resultCount}`
                                : 'No results'}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePrevious}
                        disabled={currentIndex === 0 || resultCount === 0}
                        aria-label="Previous result"
                    >
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleNext}
                        disabled={
                            currentIndex >= resultCount - 1 || resultCount === 0
                        }
                        aria-label="Next result"
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        aria-label="Close search"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

