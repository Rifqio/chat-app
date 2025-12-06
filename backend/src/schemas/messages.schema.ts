import { z } from 'zod'

export const messagesListSchema = {
    params: z.object({
        conversationId: z.string().min(1, 'conversationId is required'),
    }),
    query: z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(200).default(50),
    }),
}

export const messagesCreateSchema = {
    params: z.object({
        conversationId: z.string().min(1, 'conversationId is required'),
    }),
    body: z
        .object({
            content: z.string().trim().optional(),
            mediaKey: z.string().trim().optional(),
            mediaMimeType: z.string().trim().optional(),
        })
        .refine(
            (data) => (data.content && data.content.length > 0) || data.mediaKey,
            { message: 'Message content is required' },
        ),
}


