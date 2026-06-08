import { Router, type Request, type Response } from 'express'

const router = Router()

const certificates = [
  { id: 'c1', userId: '1', type: 'idcard', number: '320106199001011234', holderName: '张三', issueDate: '2019-06-15', expireDate: '2039-06-15', status: 'valid' },
  { id: 'c2', userId: '1', type: 'social_security', number: 'SH2020123456', holderName: '张三', issueDate: '2020-03-01', expireDate: '2050-03-01', status: 'valid' },
  { id: 'c3', userId: '1', type: 'driver_license', number: 'DL3201061990010', holderName: '张三', issueDate: '2021-09-10', expireDate: '2027-09-10', status: 'valid' },
  { id: 'c4', userId: '1', type: 'passport', number: 'E12345678', holderName: '张三', issueDate: '2022-01-20', expireDate: '2032-01-20', status: 'valid' },
]

router.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, data: certificates })
})

router.post('/', (req: Request, res: Response) => {
  const cert = { id: `c${Date.now()}`, userId: '1', ...req.body }
  certificates.push(cert)
  res.json({ success: true, data: cert })
})

router.put('/:id', (req: Request, res: Response) => {
  const idx = certificates.findIndex((c) => c.id === req.params.id)
  if (idx === -1) { res.status(404).json({ success: false, error: '证件不存在' }); return }
  certificates[idx] = { ...certificates[idx], ...req.body }
  res.json({ success: true, data: certificates[idx] })
})

router.delete('/:id', (req: Request, res: Response) => {
  const idx = certificates.findIndex((c) => c.id === req.params.id)
  if (idx === -1) { res.status(404).json({ success: false, error: '证件不存在' }); return }
  certificates.splice(idx, 1)
  res.json({ success: true })
})

export default router
