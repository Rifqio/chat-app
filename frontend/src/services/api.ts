import type {
    User,
    Conversation,
    Message,
    LoginCredentials,
    RegisterCredentials,
} from '@/types'
import axios, { type AxiosRequestConfig, type AxiosError } from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

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
    (error) => {
        return Promise.reject(error)
    },
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
    const response = await apiClient.request<T>({
        url: endpoint,
        ...options,
    })

    return response.data
}

export const authApi = {
    login: (credentials: LoginCredentials) =>
        request<{ user: User; token: string }>('/auth/login', {
            method: 'POST',
            data: credentials,
        }),

    register: (credentials: RegisterCredentials) =>
        request<{ user: User; token: string }>('/auth/register', {
            method: 'POST',
            data: credentials,
        }),

    me: () => request<User>('/auth/me'),

    logout: () => request<void>('/auth/logout', { method: 'POST' }),
}

export const usersApi = {
    getAll: () => request<User[]>('/users'),
    getById: (id: string) => request<User>(`/users/${id}`),
}

export const conversationsApi = {
    getAll: () => request<Conversation[]>('/conversations'),
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
    send: (conversationId: string, content: string, imageUrl?: string) =>
        request<Message>(`/conversations/${conversationId}/messages`, {
            method: 'POST',
            data: { content, imageUrl },
        }),
}

export const api = {
    auth: authApi,
    users: usersApi,
    conversations: conversationsApi,
    messages: messagesApi,
}
