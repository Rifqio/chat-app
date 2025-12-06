type PresenceEntry = {
    sockets: Set<string>
}

class PresenceStore {
    private users = new Map<string, PresenceEntry>()

    onConnect(userId: string, socketId: string) {
        const entry = this.users.get(userId) ?? { sockets: new Set<string>() }
        entry.sockets.add(socketId)
        this.users.set(userId, entry)
        return entry.sockets.size === 1
    }

    onDisconnect(userId: string, socketId: string) {
        const entry = this.users.get(userId)
        if (!entry) return false
        entry.sockets.delete(socketId)
        if (entry.sockets.size === 0) {
            this.users.delete(userId)
            return true
        }
        return false
    }

    isOnline(userId: string) {
        return this.users.has(userId)
    }

    getOnlineCount() {
        return this.users.size
    }

    getOnlineUsers() {
        return Array.from(this.users.keys())
    }

    getSockets(userId: string) {
        const entry = this.users.get(userId)
        return entry ? Array.from(entry.sockets) : []
    }
}

export const presenceStore = new PresenceStore()

