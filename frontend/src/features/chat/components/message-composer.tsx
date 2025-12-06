import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { Send, ImagePlus, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { api } from '@/services'

// Allowed image extensions and MIME types
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

interface MessageComposerProps {
    conversationId: string | null
    onSend: (
        content: string,
        media?: { key: string; url?: string; mimeType?: string },
    ) => void
    onTypingStart: () => void
    onTypingStop: () => void
    disabled?: boolean
}

function validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: 'Invalid file type. Only JPG, PNG, GIF, WebP, and BMP images are allowed.',
        }
    }

    // Check extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return {
            valid: false,
            error: 'Invalid file extension. Only image files are allowed.',
        }
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: 'File is too large. Maximum size is 10MB.',
        }
    }

    // Additional validation: check magic bytes (first few bytes of file)
    return { valid: true }
}

export function MessageComposer({
    conversationId,
    onSend,
    onTypingStart,
    onTypingStop,
    disabled = false,
}: MessageComposerProps) {
    const [message, setMessage] = useState('')
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [mediaKey, setMediaKey] = useState<string | null>(null)
    const [uploadProgress, setUploadProgress] = useState<number>(0)
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
    const [imageError, setImageError] = useState<string | null>(null)
    const [isMentionOpen, setIsMentionOpen] = useState(false)
    const [mentionQuery, setMentionQuery] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
        undefined,
    )

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${Math.min(
                textareaRef.current.scrollHeight,
                120,
            )}px`
        }
    }, [message])

    const handleTyping = () => {
        onTypingStart()

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }

        typingTimeoutRef.current = setTimeout(onTypingStop, 2000)
    }

    const resetMention = () => {
        setIsMentionOpen(false)
        setMentionQuery('')
    }

    const updateMentionState = (value: string) => {
        const cursor = textareaRef.current?.selectionStart ?? value.length
        const uptoCursor = value.slice(0, cursor)
        const mentionMatch = uptoCursor.match(/@([a-zA-Z]*)$/)
        setIsMentionOpen(Boolean(mentionMatch))
        setMentionQuery(mentionMatch ? mentionMatch[1] : '')
    }

    const applyMetaAiMention = () => {
        setMessage((current) => {
            const cursor = textareaRef.current?.selectionStart ?? current.length
            const uptoCursor = current.slice(0, cursor)
            const fromCursor = current.slice(cursor)
            const atIndex = uptoCursor.lastIndexOf('@')
            if (atIndex === -1) {
                resetMention()
                return current
            }

            const before = uptoCursor.slice(0, atIndex)
            const newValue = `${before}@Smith AI ${fromCursor}`.replace(
                /\s{2,}/g,
                ' ',
            )

            requestAnimationFrame(() => {
                const pos = before.length + '@Smith AI '.length
                textareaRef.current?.setSelectionRange(pos, pos)
                textareaRef.current?.focus()
            })

            resetMention()
            return newValue
        })
    }

    const handleSend = () => {
        if (!message.trim() && !mediaKey) return

        onSend(message.trim(), mediaKey ? { key: mediaKey, url: imagePreview || undefined } : undefined)
        setMessage('')
        setImagePreview(null)
        setMediaKey(null)
        setUploadProgress(0)
        setUploadStatus('idle')
        setImageError(null)
        resetMention()
        onTypingStop()

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (isMentionOpen && (e.key === 'Enter' || e.key === 'Tab')) {
            e.preventDefault()
            applyMetaAiMention()
            return
        }

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleImageSelect = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0]
        setImageError(null)

        if (!file) return

        // Validate file
        const validation = validateImageFile(file)
        if (!validation.valid) {
            setImageError(validation.error || 'Invalid file')
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            return
        }

        // Additional magic bytes validation
        const arrayBuffer = await file.slice(0, 12).arrayBuffer()
        const bytes = new Uint8Array(arrayBuffer)

        const isValidImage =
            // JPEG: FF D8 FF
            (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) ||
            // PNG: 89 50 4E 47 0D 0A 1A 0A
            (bytes[0] === 0x89 &&
                bytes[1] === 0x50 &&
                bytes[2] === 0x4e &&
                bytes[3] === 0x47) ||
            // GIF: 47 49 46 38
            (bytes[0] === 0x47 &&
                bytes[1] === 0x49 &&
                bytes[2] === 0x46 &&
                bytes[3] === 0x38) ||
            // WebP: 52 49 46 46 ... 57 45 42 50
            (bytes[0] === 0x52 &&
                bytes[1] === 0x49 &&
                bytes[2] === 0x46 &&
                bytes[3] === 0x46 &&
                bytes[8] === 0x57 &&
                bytes[9] === 0x45 &&
                bytes[10] === 0x42 &&
                bytes[11] === 0x50) ||
            // BMP: 42 4D
            (bytes[0] === 0x42 && bytes[1] === 0x4d)

        if (!isValidImage) {
            setImageError('Invalid image file. The file content does not match a valid image format.')
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            return
        }

        if (!conversationId) {
            setImageError('Select a conversation first')
            return
        }

        setUploadStatus('uploading')
        setUploadProgress(0)

        try {
            const result = await api.messages.uploadMedia(
                conversationId,
                file,
                (progress: number) => setUploadProgress(progress),
            )
            setMediaKey(result.key)
            setImagePreview(result.url)
            setUploadStatus('success')
            setUploadProgress(100)
        } catch (err) {
            console.error('Media upload failed', err)
            setImageError('Upload failed. Please try again.')
            setUploadStatus('error')
            setUploadProgress(0)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const removeImage = () => {
        setImagePreview(null)
        setImageError(null)
        setMediaKey(null)
        setUploadProgress(0)
        setUploadStatus('idle')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const canSend = (message.trim() || mediaKey) && !disabled

    return (
        <div className="border-t border-slate-200 bg-white p-4">
            {/* Image Error */}
            {imageError && (
                <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                    <p className="text-sm text-red-600">{imageError}</p>
                    <button
                        onClick={() => setImageError(null)}
                        className="text-red-400 hover:text-red-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
                <div className="mb-3 relative inline-block">
                    <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded-lg"
                    />
                    <button
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center bg-slate-800 text-white rounded-full hover:bg-slate-700 transition-colors"
                    >
                        <X className="h-3 w-3" />
                    </button>
                    {uploadStatus !== 'idle' && (
                        <div className="mt-2">
                            <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
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
                                      ? 'Upload complete'
                                      : uploadStatus === 'error'
                                        ? 'Upload failed'
                                        : null}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Composer - unified container */}
            <div className="flex items-end gap-3">
                <div className="relative flex-1">
                    {isMentionOpen && (
                        <div className="absolute -top-24 left-2 w-64 rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in slide-in-from-bottom-1">
                            <button
                                onClick={applyMetaAiMention}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 rounded-xl"
                            >
                                <div className="h-9 w-9 rounded-full bg-linear-to-br from-fuchsia-500 via-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-sm">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-slate-900">
                                        Smith AI
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        Preview • type your question after it
                                    </span>
                                </div>
                                {mentionQuery && (
                                    <span className="ml-auto text-xs text-slate-400">
                                        @{mentionQuery}
                                    </span>
                                )}
                            </button>
                        </div>
                    )}

                    <div
                        className={cn(
                            'flex items-end gap-2 px-4 py-3 bg-slate-50 rounded-2xl border border-transparent transition-all',
                            'focus-within:bg-white focus-within:border-slate-900 focus-within:shadow-[0_0_0_3px_rgba(15,23,42,0.1)]',
                        )}
                    >
                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value)
                                updateMentionState(e.target.value)
                                handleTyping()
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Write a message..."
                            rows={1}
                            disabled={disabled}
                            className="flex-1 bg-transparent resize-none outline-none text-sm text-slate-900 placeholder:text-slate-400 disabled:cursor-not-allowed max-h-[120px] leading-relaxed"
                        />

                        {/* Image Upload */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={disabled}
                            className={cn(
                                'p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors',
                                disabled && 'cursor-not-allowed opacity-50',
                            )}
                            aria-label="Attach photo"
                        >
                            <ImagePlus className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Send Button */}
                <Button
                    onClick={handleSend}
                    disabled={!canSend}
                    size="icon"
                    className="h-11 w-11 rounded-full shrink-0"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
