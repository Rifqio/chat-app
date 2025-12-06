import type {
    User,
    Conversation,
    Message,
    LoginCredentials,
    RegisterCredentials,
} from '@/types'
import axios, { type AxiosRequestConfig, type AxiosError } from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

type ApiResponse<T> = {
    success: boolean
    message?: string
    data?: T
}

// Create axios instance with base URL
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth-storage')
            ? JSON.parse(localStorage.getItem('auth-storage')!).state?.token
            : null

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => Promise.reject(error),
)

// Response interceptor to handle errors
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message?: string }>) => {
        const errorMessage =
            error.response?.data?.message || error.message || 'An error occurred'
        throw new Error(errorMessage)
    },
)

async function request<T>(
    endpoint: string,
    options: AxiosRequestConfig = {},
): Promise<T> {
    const response = await apiClient.request<ApiResponse<T>>({
        url: endpoint,
        ...options,
    })

    const payload = response.data
    if (!payload.success) {
        throw new Error(payload.message || 'Request failed')
    }
    return (payload.data as T) ?? ({} as T)
}

export const authApi = {
    login: (credentials: LoginCredentials) =>
        request<{ token: string; user: User }>('/auth/login', {
            method: 'POST',
            data: credentials,
        }),

    register: (credentials: RegisterCredentials) =>
        request<{ userId: string; email: string }>('/auth/register', {
            method: 'POST',
            data: credentials,
        }),

    verify: (input: { email: string; code: string }) =>
        request<{ token: string; user: User }>('/auth/verify', {
            method: 'POST',
            data: input,
        }),

    resend: (input: { email: string }) =>
        request<{ email: string }>('/auth/resend', {
            method: 'POST',
            data: input,
        }),

    me: () => request<User>('/auth/me'),

    logout: () => request<void>('/auth/logout', { method: 'POST' }),
}

export const usersApi = {
    getAll: () => request<User[]>('/users'),
    getById: (id: string) => request<User>(`/users/${id}`),
    updateProfile: (input: { name?: string; about?: string; avatar?: string }) =>
        request<User>('/users/me', {
            method: 'PATCH',
            data: input,
        }),
    uploadAvatar: (
        file: File,
        onUploadProgress?: (progress: number) => void,
    ) => {
        const formData = new FormData()
        formData.append('avatar', file)

        return apiClient
            .post<{ success: boolean; data: { url: string; key: string } }>(
                '/users/me/avatar',
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (event) => {
                        if (!onUploadProgress || !event.total) return
                        const progress = Math.round((event.loaded * 100) / event.total)
                        onUploadProgress(progress)
                    },
                },
            )
            .then((res) => res.data.data)
    },
}

export const conversationsApi = {
    getAll: () =>
        request<Conversation[]>('/conversations'),
    getById: (id: string) => request<Conversation>(`/conversations/${id}`),
    create: (participantId: string) =>
        request<Conversation>('/conversations', {
            method: 'POST',
            data: { participantId },
        }),
    getOrCreate: (participantId: string) =>
        request<Conversation>('/conversations/find-or-create', {
            method: 'POST',
            data: { participantId },
        }),
}

export const messagesApi = {
    getByConversation: (conversationId: string, page = 1, limit = 50) =>
        request<{ messages: Message[]; hasMore: boolean }>(
            `/conversations/${conversationId}/messages`,
            {
                params: { page, limit },
            },
        ),
    send: (
        conversationId: string,
        content: string,
        mediaKey?: string,
        mediaMimeType?: string,
    ) =>
        request<Message>(`/conversations/${conversationId}/messages`, {
            method: 'POST',
            data: { content, mediaKey, mediaMimeType },
        }),
    uploadMedia: (
        conversationId: string,
        file: File,
        onUploadProgress?: (progress: number) => void,
    ) => {
        const formData = new FormData()
        formData.append('media', file)

        return apiClient
            .post<{ success: boolean; data: { url: string; key: string; mimeType: string } }>(
                `/conversations/${conversationId}/media`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (event) => {
                        if (!onUploadProgress || !event.total) return
                        const progress = Math.round((event.loaded * 100) / event.total)
                        onUploadProgress(progress)
                    },
                },
            )
            .then((res) => res.data.data)
    },
}

export const api = {
    auth: authApi,
    users: usersApi,
    conversations: conversationsApi,
    messages: messagesApi,
}
