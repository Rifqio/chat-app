import type { Request, Response } from 'express'
import { usersService } from '../services/users.service.js'

export const usersController = {
    list: async (_req: Request, res: Response) => {
        const users = await usersService.list()
        return res.success(users)
    },

    updateProfile: async (req: Request, res: Response) => {
        const userId = req.user?.id as string
        const { name, about, avatar } = req.body
        const updated = await usersService.updateProfile(userId, {
            name,
            about,
            avatar,
        })
        return res.success(updated, 'Profile updated')
    },

    uploadAvatar: async (req: Request, res: Response) => {
        const userId = req.user?.id as string
        const file = req.file
        const result = await usersService.uploadProfileImage(userId, file)
        return res.created(result, 'Avatar uploaded')
    },
}
