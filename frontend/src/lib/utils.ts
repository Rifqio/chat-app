import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn (...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatMessageTime (date: Date): string {
    const now = new Date()
    const messageDate = new Date(date)
    const diffInHours =
        (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
        return messageDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        })
    }

    if (diffInHours < 168) {
        return messageDate.toLocaleDateString('en-US', { weekday: 'short' })
    }

    return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    })
}

export function getInitials (name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

export function generateId (): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
