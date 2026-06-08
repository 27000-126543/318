import { Router, type Request, type Response } from 'express'

const router = Router()

const evaluations = [
  { id: 'ev1', userId: '1', applicationId: 'a1', serviceName: '社保查询', rating: 5, comment: '非常快捷，秒批！', createdAt: '2026-05-20T10:20:00' },
]

router.post('/', (req: Request, res: Response) => {
  const ev = { id: `ev${Date.now()}`, userId: '1', ...req.body, createdAt: new Date().toISOString() }
  evaluations.push(ev)
  res.json({ success: true, data: ev })
})

router.get('/stats', (_req: Request, res: Response) => {
  const avg = evaluations.length > 0 ? evaluations.reduce((s, e) => s + e.rating, 0) / evaluations.length : 0
  const dist = [0, 0, 0, 0, 0]
  evaluations.forEach((e) => dist[e.rating - 1]++)
  res.json({ success: true, data: { avgRating: Math.round(avg * 10) / 10, totalCount: evaluations.length, distribution: dist } })
})

export default router
