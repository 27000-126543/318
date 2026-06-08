import { Router, type Request, type Response } from 'express'

const router = Router()

const halls = [
  { id: 'h1', name: '市政务服务中心', address: '中山路100号', region: '中心城区', windowCount: 30, todayQueue: 156, currentServing: 89 },
  { id: 'h2', name: '东区政务服务中心', address: '东方大道256号', region: '东区', windowCount: 20, todayQueue: 98, currentServing: 56 },
  { id: 'h3', name: '西区政务服务中心', address: '西湖路88号', region: '西区', windowCount: 15, todayQueue: 67, currentServing: 34 },
]

const timeSlots = [
  { time: '08:30', label: '08:30-09:30', crowding: 'low', available: 12, recommended: true, estimatedWait: 5 },
  { time: '09:30', label: '09:30-10:30', crowding: 'medium', available: 5, recommended: false, estimatedWait: 20 },
  { time: '10:30', label: '10:30-11:30', crowding: 'high', available: 2, recommended: false, estimatedWait: 45 },
  { time: '14:00', label: '14:00-15:00', crowding: 'medium', available: 6, recommended: true, estimatedWait: 15 },
  { time: '15:00', label: '15:00-16:00', crowding: 'high', available: 1, recommended: false, estimatedWait: 50 },
  { time: '16:00', label: '16:00-17:00', crowding: 'low', available: 10, recommended: true, estimatedWait: 8 },
]

const appointments: any[] = []

router.get('/halls', (_req: Request, res: Response) => {
  res.json({ success: true, data: halls })
})

router.get('/halls/:id/slots', (_req: Request, res: Response) => {
  res.json({ success: true, data: timeSlots })
})

router.post('/', (req: Request, res: Response) => {
  const apt = { id: `ap${Date.now()}`, userId: '1', ...req.body, status: 'booked' }
  appointments.push(apt)
  res.json({ success: true, data: apt })
})

router.post('/check-in', (req: Request, res: Response) => {
  const { appointmentId } = req.body
  const queueNumber = Math.floor(Math.random() * 50) + 100
  res.json({ success: true, data: { queueNumber, estimatedWait: Math.floor(Math.random() * 30) + 5, appointmentId } })
})

router.get('/queue/status', (req: Request, res: Response) => {
  const hallId = req.query.hallId
  const hall = halls.find((h) => h.id === hallId)
  res.json({ success: true, data: { currentNumber: hall?.currentServing || 89, myNumber: 112, waitingCount: (hall?.todayQueue || 156) - (hall?.currentServing || 89) } })
})

export default router
