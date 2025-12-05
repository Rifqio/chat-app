import type { Request, Response } from 'express'

export const healthController = {
    health: (_req: Request, res: Response) =>
        res.success(
            { status: 'ok', uptime: process.uptime() },
            'Service healthy',
        ),
}
