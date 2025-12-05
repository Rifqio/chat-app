import { Router } from 'express'
import { healthController } from '../controllers/health.controller.js'
import { authenticate } from '../middleware/authentication.js'

const router = Router()

router.get('/health', healthController.health)

router.get('/me', authenticate, (req, res) =>
    res.success({ user: req.user }, 'Authenticated'),
)

export default router
