import type { Request, Response } from 'express'
import multer from 'multer'
import { BadRequestException } from '../errors/httpExceptions.js'
import { messagesService } from '../services/messages.service.js'

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
])

export const mediaController = {
    upload: [
        upload.single('media'),
        async (req: Request, res: Response) => {
            const userId = req.user?.id as string
            const { conversationId } = req.params
            const file = req.file

            if (!file) {
                throw new BadRequestException('No file uploaded')
            }

            if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
                throw new BadRequestException('Invalid file type')
            }

            const result = await messagesService.uploadMedia(
                userId,
                conversationId as string,
                file,
            )

            return res.created(result, 'Media uploaded')
        },
    ],
}


