import { Router } from 'express'
import { healthController } from '../controllers/health.controller.js'
import { authenticate } from '../middleware/authentication.js'
import { authRoutes } from './modules/auth.routes.js'
import { usersRoutes } from './modules/users.routes.js'
import { conversationsRoutes } from './modules/conversations.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.get('/health', healthController.health)

router.use(authenticate)
router.use('/users', usersRoutes)
router.use('/conversations', conversationsRoutes)

export default router
