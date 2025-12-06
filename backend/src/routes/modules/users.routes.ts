import { Router } from 'express'
import multer from 'multer'
import { usersController } from '../../controllers/users.controller.js'

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
})

export const usersRoutes = Router()

usersRoutes.get('/', usersController.list)
usersRoutes.patch('/me', usersController.updateProfile)
usersRoutes.post(
    '/me/avatar',
    upload.single('avatar'),
    usersController.uploadAvatar,
)
