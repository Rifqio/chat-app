import { useState, useRef } from 'react'
import { Camera, User } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button, Input, Avatar } from '@/components/ui'
import { useAuthStore } from '@/stores'
import { cn } from '@/lib/utils'
import type { UserStatus } from '@/types'

interface ProfileSettingsModalProps {
    isOpen: boolean
    onClose: () => void
}

const statusOptions: { value: UserStatus; label: string; color: string }[] = [
    { value: 'online', label: 'Online', color: 'bg-emerald-500' },
    { value: 'away', label: 'Away', color: 'bg-amber-500' },
    { value: 'offline', label: 'Appear Offline', color: 'bg-slate-400' },
]

export function ProfileSettingsModal({
    isOpen,
    onClose,
}: ProfileSettingsModalProps) {
    const { user, setUser } = useAuthStore()
    const [name, setName] = useState(user?.name || '')
    const [status, setStatus] = useState<UserStatus>(user?.status || 'online')
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    if (!user) return null

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        const validTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
        ]
        if (!validTypes.includes(file.type)) {
            setError(
                'Please select a valid image file (JPG, PNG, GIF, or WebP)',
            )
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB')
            return
        }

        setError(null)
        const reader = new FileReader()
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleSave = async () => {
        if (!name.trim()) {
            setError('Name is required')
            return
        }

        if (name.trim().length < 2) {
            setError('Name must be at least 2 characters')
            return
        }

        setIsSaving(true)
        setError(null)

        try {
            // Simulate API call delay
            await new Promise((resolve) => setTimeout(resolve, 500))

            // Update user in store
            setUser({
                ...user,
                name: name.trim(),
                status,
                avatar: avatarPreview || user.avatar,
            })

            onClose()
        } catch {
            setError('Failed to update profile')
        } finally {
            setIsSaving(false)
        }
    }

    const displayAvatar = avatarPreview || user.avatar

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Profile Settings">
            <div className="space-y-7">
                {/* Avatar */}
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <Avatar
                            src={displayAvatar}
                            name={name || user.name}
                            size="xl"
                            className="h-24 w-24"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors shadow-lg border-2 border-white"
                            aria-label="Change avatar"
                        >
                            <Camera className="h-4 w-4" />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleAvatarChange}
                            className="hidden"
                        />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                        Personalize how others see you in conversations.
                    </p>
                </div>

                <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    {/* Name */}
                    <Input
                        label="Display Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        leftIcon={<User className="h-4 w-4" />}
                        error={error && error.includes('Name') ? error : undefined}
                    />

                    {/* Status */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-700">
                                Status
                            </label>
                            <span className="text-xs text-slate-500">
                                Pick how you appear to others
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {statusOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setStatus(option.value)}
                                    className={cn(
                                        'flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all shadow-sm',
                                        status === option.value
                                            ? 'border-slate-900 bg-white text-slate-900 shadow-md'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'h-2.5 w-2.5 rounded-full',
                                            option.color,
                                        )}
                                    />
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && !error.includes('Name') && (
                    <p className="text-sm text-red-500 text-center">{error}</p>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        isLoading={isSaving}
                        className="flex-1"
                    >
                        Save Changes
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
