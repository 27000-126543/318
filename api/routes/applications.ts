import { Router, type Request, type Response } from 'express'

const router = Router()

const applications = [
  {
    id: 'a1', userId: '1', serviceId: 's1', serviceName: '社保查询', category: '社保服务', department: '人力资源和社会保障局',
    status: 'approved', formData: { purpose: '个人查询' }, submittedAt: '2026-05-20T09:30:00', completedAt: '2026-05-20T10:15:00',
    materials: [{ materialId: 'm1-1', name: '身份证', uploaded: true }],
    approvalNodes: [
      { id: 'n1-1', nodeName: '初审', nodeOrder: 1, assignee: '李审批', status: 'approved', startedAt: '2026-05-20T09:30:00', completedAt: '2026-05-20T09:55:00', isTimeout: false, timeoutHours: 48 },
      { id: 'n1-2', nodeName: '复核', nodeOrder: 2, assignee: '王复核', status: 'approved', startedAt: '2026-05-20T09:55:00', completedAt: '2026-05-20T10:15:00', isTimeout: false, timeoutHours: 48 },
    ],
  },
  {
    id: 'a2', userId: '1', serviceId: 's2', serviceName: '公积金提取', category: '住房服务', department: '住房公积金管理中心',
    status: 're_review', formData: { extractType: '租房提取', amount: '36000' }, submittedAt: '2026-05-28T14:20:00',
    materials: [{ materialId: 'm2-1', name: '身份证', uploaded: true }, { materialId: 'm2-2', name: '银行卡', uploaded: true }, { materialId: 'm2-3', name: '购房合同/租房合同', uploaded: true }],
    approvalNodes: [
      { id: 'n2-1', nodeName: '初审', nodeOrder: 1, assignee: '赵初审', status: 'approved', startedAt: '2026-05-28T14:20:00', completedAt: '2026-05-29T10:30:00', isTimeout: false, timeoutHours: 48 },
      { id: 'n2-2', nodeName: '复核', nodeOrder: 2, assignee: '钱复核', status: 'in_progress', startedAt: '2026-05-29T10:30:00', isTimeout: false, timeoutHours: 48 },
      { id: 'n2-3', nodeName: '终审', nodeOrder: 3, assignee: '孙终审', status: 'pending', isTimeout: false, timeoutHours: 72 },
    ],
  },
]

router.get('/', (req: Request, res: Response) => {
  const { status } = req.query
  let result = applications
  if (status) result = result.filter((a) => a.status === status)
  res.json({ success: true, data: { list: result, total: result.length } })
})

router.get('/:id', (req: Request, res: Response) => {
  const app = applications.find((a) => a.id === req.params.id)
  if (!app) { res.status(404).json({ success: false, error: '办件不存在' }); return }
  res.json({ success: true, data: app })
})

router.post('/', (req: Request, res: Response) => {
  const app = { id: `a${Date.now()}`, userId: '1', ...req.body, status: 'submitted', submittedAt: new Date().toISOString() }
  applications.unshift(app)
  res.json({ success: true, data: app })
})

router.put('/:id/approve', (req: Request, res: Response) => {
  const app = applications.find((a) => a.id === req.params.id)
  if (!app) { res.status(404).json({ success: false, error: '办件不存在' }); return }
  res.json({ success: true, data: app })
})

export default router
