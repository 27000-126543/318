import { Router, type Request, type Response } from 'express'

const router = Router()

const services = [
  { id: 's1', name: '社保查询', category: '社保服务', department: '人力资源和社会保障局', description: '查询个人社保缴费记录、参保信息、待遇发放情况', avgProcessingDays: 1, onlineOnly: true, heat: 98 },
  { id: 's2', name: '公积金提取', category: '住房服务', department: '住房公积金管理中心', description: '办理住房公积金提取业务', avgProcessingDays: 3, onlineOnly: true, heat: 95 },
  { id: 's3', name: '税务申报', category: '税务服务', department: '税务局', description: '个人所得税年度汇算清缴申报', avgProcessingDays: 5, onlineOnly: true, heat: 92 },
  { id: 's4', name: '户籍迁移', category: '户政服务', department: '公安局', description: '办理户口迁移业务', avgProcessingDays: 15, onlineOnly: false, heat: 78 },
  { id: 's5', name: '驾驶证换证', category: '交通服务', department: '公安局交通管理局', description: '驾驶证到期换证', avgProcessingDays: 3, onlineOnly: true, heat: 85 },
  { id: 's6', name: '居住证办理', category: '户政服务', department: '公安局', description: '首次申领居住证或居住证签注', avgProcessingDays: 10, onlineOnly: false, heat: 72 },
  { id: 's7', name: '医保报销', category: '医疗服务', department: '医疗保障局', description: '办理门诊、住院医疗费用报销', avgProcessingDays: 7, onlineOnly: true, heat: 88 },
  { id: 's8', name: '不动产登记', category: '房产服务', department: '自然资源和规划局', description: '办理不动产登记', avgProcessingDays: 10, onlineOnly: false, heat: 65 },
  { id: 's9', name: '婚姻登记预约', category: '民政服务', department: '民政局', description: '预约办理结婚登记或离婚登记', avgProcessingDays: 1, onlineOnly: false, heat: 70 },
  { id: 's10', name: '企业注册登记', category: '商事服务', department: '市场监督管理局', description: '办理企业设立登记', avgProcessingDays: 5, onlineOnly: true, heat: 60 },
]

router.get('/', (req: Request, res: Response) => {
  const { category, keyword } = req.query
  let result = services
  if (category && category !== '全部') result = result.filter((s) => s.category === category)
  if (keyword) result = result.filter((s) => s.name.includes(keyword as string) || s.department.includes(keyword as string))
  res.json({ success: true, data: result })
})

router.get('/:id', (req: Request, res: Response) => {
  const service = services.find((s) => s.id === req.params.id)
  if (!service) { res.status(404).json({ success: false, error: '事项不存在' }); return }
  res.json({ success: true, data: service })
})

export default router
