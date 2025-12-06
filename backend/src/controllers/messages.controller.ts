import type { Request, Response } from 'express'
import { messagesService } from '../services/messages.service.js'
import { BadRequestException } from '../errors/httpExceptions.js'

export const messagesController = {
    list: async (req: Request, res: Response) => {
        const userId = req.user?.id
        const { conversationId } = req.params
        const page = Number(req.query.page ?? 1)
        const limit = Number(req.query.limit ?? 50)

        const result = await messagesService.listByConversation(
            userId as string,
            conversationId as string,
            page,
            limit,
        )

        return res.success(result)
    },

    create: async (req: Request, res: Response) => {
        const userId = req.user?.id
        const { conversationId } = req.params
        const { content, imageUrl } = req.body

        if (!content && !imageUrl) {
            throw new BadRequestException('Message content is required')
        }

        const message = await messagesService.create(
            userId as string,
            conversationId as string,
            content,
            imageUrl,
        )
        return res.created(message, 'Message sent')
    },
}
