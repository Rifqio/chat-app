import type { Request, Response } from 'express'
import { conversationsService } from '../services/conversations.service.js'
import { BadRequestException } from '../errors/httpExceptions.js'

export const conversationsController = {
    list: async (req: Request, res: Response) => {
        const userId = req.user?.id
        const conversations = await conversationsService.listForUser(
            userId as string,
        )
        return res.success(conversations)
    },

    create: async (req: Request, res: Response) => {
        const userId = req.user?.id
        const { participantId } = req.body

        if (!participantId) {
            throw new BadRequestException('participantId is required')
        }

        const conversation = await conversationsService.create(
            userId as string,
            participantId,
        )
        return res.success(conversation, 'Conversation created')
    },

    findOrCreate: async (req: Request, res: Response) => {
        const userId = req.user?.id
        const { participantId } = req.body

        if (!participantId) {
            throw new BadRequestException('participantId is required')
        }

        const conversation = await conversationsService.getOrCreate(
            userId as string,
            participantId,
        )
        return res.success(conversation, 'Conversation ready')
    },
}
