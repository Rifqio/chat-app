import { Router } from 'express'
import { conversationsController } from '../../controllers/conversations.controller.js'
import { messagesController } from '../../controllers/messages.controller.js'
import { validate } from '../../middleware/validate.js'
import {
    messagesCreateSchema,
    messagesListSchema,
} from '../../schemas/messages.schema.js'
import { mediaController } from '../../controllers/media.controller.js'

export const conversationsRoutes = Router()

conversationsRoutes.get('/', conversationsController.list)
conversationsRoutes.post('/', conversationsController.create)
conversationsRoutes.post(
    '/find-or-create',
    conversationsController.findOrCreate,
)
conversationsRoutes.get(
    '/:conversationId/messages',
    validate(messagesListSchema),
    messagesController.list,
)
conversationsRoutes.post(
    '/:conversationId/messages',
    validate(messagesCreateSchema),
    messagesController.create,
)
conversationsRoutes.post(
    '/:conversationId/media',
    ...mediaController.upload,
)
