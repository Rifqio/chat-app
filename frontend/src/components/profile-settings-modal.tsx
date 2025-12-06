import { useState, useRef } from 'react';
import { Camera, User } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button, Input, Avatar } from '@/components/ui';
import { useAuthStore, useChatStore } from '@/stores';
import { cn } from '@/lib/utils';
import { api } from '@/services';

interface ProfileSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProfileSettingsModal({
    isOpen,
    onClose,
}: ProfileSettingsModalProps) {
    const { user, setUser } = useAuthStore();
    const { upsertUser } = useChatStore();
    const [name, setName] = useState(user?.name || '');
    const [about, setAbout] = useState(user?.about || '');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [uploadMessage, setUploadMessage] = useState<string>('');
    const [avatarKey, setAvatarKey] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!user) return null;

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
        ];
        if (!validTypes.includes(file.type)) {
            setError(
                'Please select a valid image file (JPG, PNG, GIF, or WebP)',
            );
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        setError(null);
        setUploadStatus('uploading');
        setUploadProgress(0);
        setAvatarKey(null);

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        try {
            const result = await api.users.uploadAvatar(
                file,
                (progress) => setUploadProgress(progress),
            );
            setUploadStatus('success');
            setUploadMessage('Upload successful');
            setAvatarKey(result.key);
            setUploadProgress(100);
            console.log('Avatar upload result:', result);
        } catch (err) {
            console.error('Avatar upload failed', err);
            setUploadStatus('error');
            setUploadMessage('Upload failed');
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            setError('Name is required');
            return;
        }

        if (name.trim().length < 2) {
            setError('Name must be at least 2 characters');
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const payload = {
                name: name.trim(),
                about: about.trim(),
                avatar: avatarKey ?? undefined,
            };
            const updated = await api.users.updateProfile(payload);

            // Update user in store and chat caches
            setUser({
                ...user,
                ...updated,
                status: user.status,
            });
            upsertUser({ ...updated, status: user.status });

            onClose();
        } catch (err) {
            console.error(err);
            setError('Failed to update profile');
            setUploadStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const displayAvatar = avatarPreview || user.avatar;

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
                    {uploadStatus !== 'idle' && (
                        <div className="w-full mt-3">
                            <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                                <div
                                    className={cn(
                                        'h-full transition-all',
                                        uploadStatus === 'success'
                                            ? 'bg-emerald-500'
                                            : uploadStatus === 'error'
                                              ? 'bg-red-500'
                                              : 'bg-blue-500',
                                    )}
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                {uploadStatus === 'uploading'
                                    ? `Uploading... ${uploadProgress}%`
                                    : uploadStatus === 'success'
                                      ? uploadMessage || 'Upload complete'
                                      : uploadStatus === 'error'
                                        ? 'Upload failed'
                                        : null}
                            </p>
                        </div>
                    )}
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
                        error={
                            error && error.includes('Name') ? error : undefined
                        }
                    />

                    {/* About */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            About
                        </label>
                        <textarea
                            value={about}
                            onChange={(e) => setAbout(e.target.value)}
                            placeholder="Share a short status or bio"
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-slate-400 focus:outline-none min-h-[80px]"
                            maxLength={240}
                        />
                        <p className="text-xs text-slate-500">
                            Visible to people you chat with. {about.length}/240
                        </p>
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
    );
}
