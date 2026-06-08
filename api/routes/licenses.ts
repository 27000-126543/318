import { Router, type Request, type Response } from 'express'

const router = Router()

const licenses = [
  { id: 'el1', userId: '1', type: '身份证', licenseNumber: 'EL-ID-320106199001011234', issueDate: '2024-01-15', expireDate: '2039-06-15', status: 'active', qrCode: 'QR-ID-001', shares: [] },
  { id: 'el2', userId: '1', type: '社保卡', licenseNumber: 'EL-SS-SH2020123456', issueDate: '2024-03-20', expireDate: '2050-03-01', status: 'active', qrCode: 'QR-SS-001', shares: [{ id: 'ls1', targetOrg: '市住房公积金管理中心', expireDate: '2026-07-01', createdAt: '2026-05-01', status: 'active' }] },
  { id: 'el3', userId: '1', type: '驾驶证', licenseNumber: 'EL-DL-DL3201061990010', issueDate: '2024-06-10', expireDate: '2027-09-10', status: 'active', qrCode: 'QR-DL-001', shares: [] },
  { id: 'el4', userId: '1', type: '居住证', licenseNumber: 'EL-JZ-JZ20230815001', issueDate: '2024-08-15', expireDate: '2025-08-15', status: 'expired', qrCode: 'QR-JZ-001', shares: [] },
]

router.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, data: licenses })
})

router.post('/apply', (req: Request, res: Response) => {
  const license = { id: `el${Date.now()}`, userId: '1', ...req.body, status: 'pending', qrCode: `QR-${Date.now()}`, shares: [] }
  licenses.push(license)
  res.json({ success: true, data: license })
})

router.post('/:id/share', (req: Request, res: Response) => {
  const license = licenses.find((l) => l.id === req.params.id)
  if (!license) { res.status(404).json({ success: false, error: '证照不存在' }); return }
  const share = { id: `ls${Date.now()}`, ...req.body, createdAt: new Date().toISOString(), status: 'active' }
  license.shares.push(share)
  res.json({ success: true, data: share })
})

router.put('/:id/renew', (req: Request, res: Response) => {
  const license = licenses.find((l) => l.id === req.params.id)
  if (!license) { res.status(404).json({ success: false, error: '证照不存在' }); return }
  license.status = 'renewing'
  res.json({ success: true, data: license })
})

export default router
