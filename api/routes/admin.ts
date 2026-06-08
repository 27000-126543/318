import { Router, type Request, type Response } from 'express'

const router = Router()

router.get('/dashboard', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalApplications: 128456,
      avgProcessingTime: 4.2,
      windowBusyness: 73,
      complaintResolutionTime: 2.8,
      applicationTrend: [
        { month: '2025-07', count: 8200 }, { month: '2025-08', count: 7800 }, { month: '2025-09', count: 9100 },
        { month: '2025-10', count: 8500 }, { month: '2025-11', count: 10200 }, { month: '2025-12', count: 11500 },
        { month: '2026-01', count: 9800 }, { month: '2026-02', count: 7600 }, { month: '2026-03', count: 10800 },
        { month: '2026-04', count: 11200 }, { month: '2026-05', count: 12500 }, { month: '2026-06', count: 13200 },
      ],
      categoryDistribution: [
        { name: '社保服务', value: 28500 }, { name: '住房服务', value: 22300 }, { name: '税务服务', value: 19800 },
        { name: '户政服务', value: 18600 }, { name: '交通服务', value: 15200 }, { name: '医疗服务', value: 12600 },
        { name: '民政服务', value: 6800 }, { name: '其他', value: 4656 },
      ],
      regionComparison: [
        { region: '中心城区', count: 45200, avgTime: 3.8 }, { region: '东区', count: 28600, avgTime: 4.1 },
        { region: '西区', count: 21800, avgTime: 4.5 }, { region: '南区', count: 19500, avgTime: 4.3 },
        { region: '北区', count: 13356, avgTime: 4.8 },
      ],
      departmentStats: [
        { department: '人力资源和社会保障局', total: 28500, avgTime: 2.1, satisfaction: 4.6 },
        { department: '住房公积金管理中心', total: 22300, avgTime: 3.5, satisfaction: 4.3 },
        { department: '税务局', total: 19800, avgTime: 4.2, satisfaction: 4.1 },
        { department: '公安局', total: 18600, avgTime: 6.8, satisfaction: 3.8 },
        { department: '医疗保障局', total: 12600, avgTime: 5.2, satisfaction: 4.0 },
      ],
    },
  })
})

router.get('/prediction', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      nextQuarterPrediction: [
        { month: '2026-07', predicted: 14500 }, { month: '2026-08', predicted: 13200 },
        { month: '2026-09', predicted: 15800 },
      ],
      suggestions: [
        { type: 'window', message: '建议9月增设3个社保窗口', priority: 'high' },
        { type: 'staff', message: '建议7月增派2名审批人员', priority: 'medium' },
        { type: 'window', message: '建议8月增设1个税务窗口', priority: 'low' },
        { type: 'staff', message: '建议9月增派1名复核人员', priority: 'medium' },
      ],
    },
  })
})

router.get('/report', (req: Request, res: Response) => {
  const month = req.query.month as string
  if (!month) {
    res.json({ success: true, data: [] })
    return
  }
  res.json({
    success: true,
    data: {
      month,
      totalApplications: 11200 + Math.floor(Math.random() * 3000),
      avgProcessingTime: Math.round((3.5 + Math.random() * 2) * 10) / 10,
      satisfaction: Math.round((3.8 + Math.random() * 0.8) * 10) / 10,
      timeoutCount: 120 + Math.floor(Math.random() * 80),
      categoryBreakdown: [
        { category: '社保服务', count: 3200, avgTime: 2.1 },
        { category: '住房服务', count: 2400, avgTime: 3.4 },
        { category: '税务服务', count: 2100, avgTime: 4.2 },
        { category: '户政服务', count: 1900, avgTime: 6.6 },
        { category: '其他', count: 1600, avgTime: 4.7 },
      ],
    },
  })
})

router.get('/windows/busyness', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      { hallId: 'h1', hallName: '市政务服务中心', busyness: 78, todayServed: 89, todayTotal: 156 },
      { hallId: 'h2', hallName: '东区政务服务中心', busyness: 62, todayServed: 56, todayTotal: 98 },
      { hallId: 'h3', hallName: '西区政务服务中心', busyness: 51, todayServed: 34, todayTotal: 67 },
    ],
  })
})

export default router
