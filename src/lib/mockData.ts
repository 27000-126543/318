export interface User {
  id: string
  name: string
  phone: string
  idCard?: string
  avatar?: string
  realNameVerified: boolean
  authLevel: number
  role: 'citizen' | 'approver' | 'admin'
}

export interface Certificate {
  id: string
  userId: string
  type: 'idcard' | 'social_security' | 'driver_license' | 'passport' | 'residence'
  number: string
  holderName: string
  issueDate: string
  expireDate: string
  status: 'valid' | 'expired' | 'pending_update'
}

export interface ServiceItem {
  id: string
  name: string
  category: string
  department: string
  description: string
  requiredMaterials: MaterialItem[]
  avgProcessingDays: number
  onlineOnly: boolean
  heat: number
}

export interface MaterialItem {
  id: string
  name: string
  required: boolean
  fromCertificate?: Certificate['type']
  description: string
}

export interface Application {
  id: string
  userId: string
  serviceId: string
  serviceName: string
  category: string
  department: string
  status: 'submitted' | 'first_review' | 're_review' | 'final_review' | 'supplement' | 'approved' | 'rejected' | 'timeout'
  formData: Record<string, string>
  submittedAt: string
  completedAt?: string
  approvalNodes: ApprovalNode[]
  materials: { materialId: string; name: string; uploaded: boolean }[]
  actionRecords: ActionRecord[]
}

export interface ApprovalNode {
  id: string
  nodeName: string
  nodeOrder: number
  assignee: string
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'timeout'
  startedAt?: string
  completedAt?: string
  comment?: string
  isTimeout: boolean
  timeoutHours: number
}

export interface ActionRecord {
  id: string
  action: 'submit' | 'approve' | 'reject' | 'return_supplement' | 'upload_material' | 'resubmit' | 'timeout_escalation' | 'finalize'
  nodeName?: string
  operator: string
  comment?: string
  materialName?: string
  createdAt: string
}

export interface Hall {
  id: string
  name: string
  address: string
  region: string
  windowCount: number
  todayQueue: number
  currentServing: number
}

export interface TimeSlot {
  time: string
  label: string
  crowding: 'low' | 'medium' | 'high'
  available: number
  recommended: boolean
  estimatedWait: number
}

export interface Appointment {
  id: string
  userId: string
  hallId: string
  hallName: string
  serviceType: string
  appointmentDate: string
  timeSlot: string
  status: 'booked' | 'checked_in' | 'serving' | 'completed' | 'cancelled'
  queueNumber?: number
}

export interface ELicense {
  id: string
  userId: string
  type: string
  licenseNumber: string
  issueDate: string
  expireDate: string
  status: 'active' | 'expired' | 'pending' | 'renewing'
  qrCode: string
  shares: LicenseShare[]
}

export interface LicenseShare {
  id: string
  targetOrg: string
  expireDate: string
  createdAt: string
  status: 'active' | 'expired'
}

export interface Evaluation {
  id: string
  userId: string
  applicationId: string
  serviceName: string
  rating: number
  comment: string
  createdAt: string
}

export interface Notification {
  id: string
  type: 'submitted' | 'supplement' | 'timeout' | 'approved' | 'rejected' | 'progress'
  title: string
  applicationId: string
  serviceName: string
  read: boolean
  createdAt: string
}

export interface DashboardData {
  totalApplications: number
  avgProcessingTime: number
  windowBusyness: number
  complaintResolutionTime: number
  applicationTrend: { month: string; count: number }[]
  categoryDistribution: { name: string; value: number }[]
  regionComparison: { region: string; count: number; avgTime: number }[]
  departmentStats: { department: string; total: number; avgTime: number; satisfaction: number }[]
}

export interface PredictionData {
  month: string
  predicted: number
  actual?: number
}

export interface ReportData {
  month: string
  totalApplications: number
  avgProcessingTime: number
  satisfaction: number
  timeoutCount: number
  categoryBreakdown: { category: string; count: number; avgTime: number }[]
}

const certificateTypeLabels: Record<Certificate['type'], string> = {
  idcard: '身份证',
  social_security: '社保卡',
  driver_license: '驾驶证',
  passport: '护照',
  residence: '居住证',
}

export { certificateTypeLabels }

export const mockUser: User = {
  id: '1',
  name: '张三',
  phone: '138****8888',
  idCard: '3201**********1234',
  realNameVerified: true,
  authLevel: 3,
  role: 'citizen',
}

export const mockCertificates: Certificate[] = [
  { id: 'c1', userId: '1', type: 'idcard', number: '320106199001011234', holderName: '张三', issueDate: '2019-06-15', expireDate: '2039-06-15', status: 'valid' },
  { id: 'c2', userId: '1', type: 'social_security', number: 'SH2020123456', holderName: '张三', issueDate: '2020-03-01', expireDate: '2050-03-01', status: 'valid' },
  { id: 'c3', userId: '1', type: 'driver_license', number: 'DL3201061990010', holderName: '张三', issueDate: '2021-09-10', expireDate: '2027-09-10', status: 'valid' },
  { id: 'c4', userId: '1', type: 'passport', number: 'E12345678', holderName: '张三', issueDate: '2022-01-20', expireDate: '2032-01-20', status: 'valid' },
  { id: 'c5', userId: '1', type: 'residence', number: 'JZ20230815001', holderName: '张三', issueDate: '2023-08-15', expireDate: '2028-08-15', status: 'pending_update' },
]

export const mockServices: ServiceItem[] = [
  {
    id: 's1', name: '社保查询', category: '社保服务', department: '人力资源和社会保障局',
    description: '查询个人社保缴费记录、参保信息、待遇发放情况',
    avgProcessingDays: 1, onlineOnly: true, heat: 98,
    requiredMaterials: [
      { id: 'm1-1', name: '身份证', required: true, fromCertificate: 'idcard', description: '本人身份证正反面' },
    ],
  },
  {
    id: 's2', name: '公积金提取', category: '住房服务', department: '住房公积金管理中心',
    description: '办理住房公积金提取业务，支持购房、租房、还贷等多种提取方式',
    avgProcessingDays: 3, onlineOnly: true, heat: 95,
    requiredMaterials: [
      { id: 'm2-1', name: '身份证', required: true, fromCertificate: 'idcard', description: '本人身份证正反面' },
      { id: 'm2-2', name: '银行卡', required: true, description: '本人名下银行卡' },
      { id: 'm2-3', name: '购房合同/租房合同', required: true, description: '根据提取类型提供' },
    ],
  },
  {
    id: 's3', name: '税务申报', category: '税务服务', department: '税务局',
    description: '个人所得税年度汇算清缴申报',
    avgProcessingDays: 5, onlineOnly: true, heat: 92,
    requiredMaterials: [
      { id: 'm3-1', name: '身份证', required: true, fromCertificate: 'idcard', description: '本人身份证正反面' },
      { id: 'm3-2', name: '收入证明', required: true, description: '年度收入相关证明' },
    ],
  },
  {
    id: 's4', name: '户籍迁移', category: '户政服务', department: '公安局',
    description: '办理户口迁移业务，包括市内迁移、跨市迁移等',
    avgProcessingDays: 15, onlineOnly: false, heat: 78,
    requiredMaterials: [
      { id: 'm4-1', name: '身份证', required: true, fromCertificate: 'idcard', description: '本人身份证正反面' },
      { id: 'm4-2', name: '户口簿', required: true, description: '原户口簿原件' },
      { id: 'm4-3', name: '房产证/租赁合同', required: true, description: '迁入地住所证明' },
      { id: 'm4-4', name: '迁移证明', required: true, description: '派出所开具的迁移证明' },
    ],
  },
  {
    id: 's5', name: '驾驶证换证', category: '交通服务', department: '公安局交通管理局',
    description: '办理驾驶证到期换证、损毁换证、遗失补证',
    avgProcessingDays: 3, onlineOnly: true, heat: 85,
    requiredMaterials: [
      { id: 'm5-1', name: '身份证', required: true, fromCertificate: 'idcard', description: '本人身份证正反面' },
      { id: 'm5-2', name: '驾驶证', required: true, fromCertificate: 'driver_license', description: '原驾驶证' },
      { id: 'm5-3', name: '体检证明', required: true, description: '县级及以上医院体检证明' },
      { id: 'm5-4', name: '照片', required: true, description: '一寸白底免冠照片' },
    ],
  },
  {
    id: 's6', name: '居住证办理', category: '户政服务', department: '公安局',
    description: '首次申领居住证或居住证签注',
    avgProcessingDays: 10, onlineOnly: false, heat: 72,
    requiredMaterials: [
      { id: 'm6-1', name: '身份证', required: true, fromCertificate: 'idcard', description: '本人身份证正反面' },
      { id: 'm6-2', name: '居住证明', required: true, description: '租赁合同或房产证' },
      { id: 'm6-3', name: '就业证明', required: false, description: '劳动合同或社保证明' },
    ],
  },
  {
    id: 's7', name: '医保报销', category: '医疗服务', department: '医疗保障局',
    description: '办理门诊、住院医疗费用报销',
    avgProcessingDays: 7, onlineOnly: true, heat: 88,
    requiredMaterials: [
      { id: 'm7-1', name: '身份证', required: true, fromCertificate: 'idcard', description: '本人身份证正反面' },
      { id: 'm7-2', name: '社保卡', required: true, fromCertificate: 'social_security', description: '本人社保卡' },
      { id: 'm7-3', name: '医疗发票', required: true, description: '原始医疗费用发票' },
      { id: 'm7-4', name: '病历', required: true, description: '门诊病历或出院小结' },
    ],
  },
  {
    id: 's8', name: '不动产登记', category: '房产服务', department: '自然资源和规划局',
    description: '办理不动产首次登记、转移登记、变更登记',
    avgProcessingDays: 10, onlineOnly: false, heat: 65,
    requiredMaterials: [
      { id: 'm8-1', name: '身份证', required: true, fromCertificate: 'idcard', description: '本人身份证正反面' },
      { id: 'm8-2', name: '购房合同', required: true, description: '商品房买卖合同' },
      { id: 'm8-3', name: '契税完税证明', required: true, description: '税务部门开具' },
      { id: 'm8-4', name: '开发商资质', required: true, description: '开发商相关资质文件' },
    ],
  },
  {
    id: 's9', name: '婚姻登记预约', category: '民政服务', department: '民政局',
    description: '预约办理结婚登记或离婚登记',
    avgProcessingDays: 1, onlineOnly: false, heat: 70,
    requiredMaterials: [
      { id: 'm9-1', name: '身份证', required: true, fromCertificate: 'idcard', description: '双方身份证' },
      { id: 'm9-2', name: '户口簿', required: true, description: '双方户口簿' },
      { id: 'm9-3', name: '照片', required: true, description: '两寸双方合影照片' },
    ],
  },
  {
    id: 's10', name: '企业注册登记', category: '商事服务', department: '市场监督管理局',
    description: '办理企业设立登记、变更登记、注销登记',
    avgProcessingDays: 5, onlineOnly: true, heat: 60,
    requiredMaterials: [
      { id: 'm10-1', name: '身份证', required: true, fromCertificate: 'idcard', description: '法定代表人身份证' },
      { id: 'm10-2', name: '公司章程', required: true, description: '有限责任公司章程' },
      { id: 'm10-3', name: '经营场所证明', required: true, description: '房产证或租赁合同' },
    ],
  },
]

export const mockApplications: Application[] = [
  {
    id: 'a1', userId: '1', serviceId: 's1', serviceName: '社保查询', category: '社保服务', department: '人力资源和社会保障局',
    status: 'approved', formData: { purpose: '个人查询' }, submittedAt: '2026-05-20T09:30:00', completedAt: '2026-05-20T10:15:00',
    materials: [{ materialId: 'm1-1', name: '身份证', uploaded: true }],
    approvalNodes: [
      { id: 'n1-1', nodeName: '初审', nodeOrder: 1, assignee: '李审批', status: 'approved', startedAt: '2026-05-20T09:30:00', completedAt: '2026-05-20T09:55:00', isTimeout: false, timeoutHours: 48 },
      { id: 'n1-2', nodeName: '复核', nodeOrder: 2, assignee: '王复核', status: 'approved', startedAt: '2026-05-20T09:55:00', completedAt: '2026-05-20T10:05:00', isTimeout: false, timeoutHours: 48 },
      { id: 'n1-3', nodeName: '终审', nodeOrder: 3, assignee: '张终审', status: 'approved', startedAt: '2026-05-20T10:05:00', completedAt: '2026-05-20T10:15:00', isTimeout: false, timeoutHours: 72 },
    ],
    actionRecords: [
      { id: 'ar1-1', action: 'submit', operator: '张三', createdAt: '2026-05-20T09:30:00' },
      { id: 'ar1-2', action: 'approve', nodeName: '初审', operator: '李审批', createdAt: '2026-05-20T09:55:00' },
      { id: 'ar1-3', action: 'approve', nodeName: '复核', operator: '王复核', createdAt: '2026-05-20T10:05:00' },
      { id: 'ar1-4', action: 'finalize', nodeName: '终审', operator: '张终审', createdAt: '2026-05-20T10:15:00' },
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
    actionRecords: [
      { id: 'ar2-1', action: 'submit', operator: '张三', createdAt: '2026-05-28T14:20:00' },
      { id: 'ar2-2', action: 'approve', nodeName: '初审', operator: '赵初审', createdAt: '2026-05-29T10:30:00' },
    ],
  },
  {
    id: 'a3', userId: '1', serviceId: 's5', serviceName: '驾驶证换证', category: '交通服务', department: '公安局交通管理局',
    status: 'first_review', formData: { replaceType: '到期换证' }, submittedAt: '2026-06-01T11:00:00',
    materials: [{ materialId: 'm5-1', name: '身份证', uploaded: true }, { materialId: 'm5-2', name: '驾驶证', uploaded: true }, { materialId: 'm5-3', name: '体检证明', uploaded: true }, { materialId: 'm5-4', name: '照片', uploaded: false }],
    approvalNodes: [
      { id: 'n3-1', nodeName: '初审', nodeOrder: 1, assignee: '周初审', status: 'in_progress', startedAt: '2026-06-01T11:00:00', isTimeout: true, timeoutHours: 48 },
      { id: 'n3-2', nodeName: '复核', nodeOrder: 2, assignee: '吴复核', status: 'pending', isTimeout: false, timeoutHours: 48 },
      { id: 'n3-3', nodeName: '终审', nodeOrder: 3, assignee: '郑终审', status: 'pending', isTimeout: false, timeoutHours: 48 },
    ],
    actionRecords: [
      { id: 'ar3-1', action: 'submit', operator: '张三', createdAt: '2026-06-01T11:00:00' },
      { id: 'ar3-2', action: 'timeout_escalation', nodeName: '初审', operator: '系统', comment: '初审已超48小时未处理，已升级通知主管', createdAt: '2026-06-03T11:00:00' },
    ],
  },
  {
    id: 'a4', userId: '1', serviceId: 's7', serviceName: '医保报销', category: '医疗服务', department: '医疗保障局',
    status: 'supplement', formData: { hospitalName: '市第一人民医院', amount: '12500' }, submittedAt: '2026-05-25T16:45:00',
    materials: [{ materialId: 'm7-1', name: '身份证', uploaded: true }, { materialId: 'm7-2', name: '社保卡', uploaded: true }, { materialId: 'm7-3', name: '医疗发票', uploaded: false }, { materialId: 'm7-4', name: '病历', uploaded: false }],
    approvalNodes: [
      { id: 'n4-1', nodeName: '初审', nodeOrder: 1, assignee: '陈初审', status: 'rejected', startedAt: '2026-05-25T16:45:00', completedAt: '2026-05-27T09:20:00', comment: '请补充医疗发票原件和住院病历', isTimeout: false, timeoutHours: 48 },
      { id: 'n4-2', nodeName: '复核', nodeOrder: 2, assignee: '待分配', status: 'pending', isTimeout: false, timeoutHours: 48 },
      { id: 'n4-3', nodeName: '终审', nodeOrder: 3, assignee: '待分配', status: 'pending', isTimeout: false, timeoutHours: 72 },
    ],
    actionRecords: [
      { id: 'ar4-1', action: 'submit', operator: '张三', createdAt: '2026-05-25T16:45:00' },
      { id: 'ar4-2', action: 'return_supplement', nodeName: '初审', operator: '陈初审', comment: '请补充医疗发票原件和住院病历', createdAt: '2026-05-27T09:20:00' },
    ],
  },
  {
    id: 'a5', userId: '1', serviceId: 's3', serviceName: '税务申报', category: '税务服务', department: '税务局',
    status: 'approved', formData: { purpose: '年度汇算清缴' }, submittedAt: '2026-04-10T08:30:00', completedAt: '2026-04-15T16:00:00',
    materials: [{ materialId: 'm3-1', name: '身份证', uploaded: true }, { materialId: 'm3-2', name: '收入证明', uploaded: true }],
    approvalNodes: [
      { id: 'n5-1', nodeName: '初审', nodeOrder: 1, assignee: '何初审', status: 'approved', startedAt: '2026-04-10T08:30:00', completedAt: '2026-04-11T14:00:00', isTimeout: false, timeoutHours: 48 },
      { id: 'n5-2', nodeName: '复核', nodeOrder: 2, assignee: '吕复核', status: 'approved', startedAt: '2026-04-11T14:00:00', completedAt: '2026-04-13T10:00:00', isTimeout: false, timeoutHours: 48 },
      { id: 'n5-3', nodeName: '终审', nodeOrder: 3, assignee: '施终审', status: 'approved', startedAt: '2026-04-13T10:00:00', completedAt: '2026-04-15T16:00:00', isTimeout: false, timeoutHours: 72 },
    ],
    actionRecords: [
      { id: 'ar5-1', action: 'submit', operator: '张三', createdAt: '2026-04-10T08:30:00' },
      { id: 'ar5-2', action: 'approve', nodeName: '初审', operator: '何初审', createdAt: '2026-04-11T14:00:00' },
      { id: 'ar5-3', action: 'approve', nodeName: '复核', operator: '吕复核', createdAt: '2026-04-13T10:00:00' },
      { id: 'ar5-4', action: 'finalize', nodeName: '终审', operator: '施终审', createdAt: '2026-04-15T16:00:00' },
    ],
  },
]

export const mockHalls: Hall[] = [
  { id: 'h1', name: '市政务服务中心', address: '中山路100号', region: '中心城区', windowCount: 30, todayQueue: 156, currentServing: 89 },
  { id: 'h2', name: '东区政务服务中心', address: '东方大道256号', region: '东区', windowCount: 20, todayQueue: 98, currentServing: 56 },
  { id: 'h3', name: '西区政务服务中心', address: '西湖路88号', region: '西区', windowCount: 15, todayQueue: 67, currentServing: 34 },
  { id: 'h4', name: '南区政务服务中心', address: '南山大道166号', region: '南区', windowCount: 18, todayQueue: 82, currentServing: 45 },
  { id: 'h5', name: '北区政务服务中心', address: '北京路512号', region: '北区', windowCount: 16, todayQueue: 73, currentServing: 38 },
]

export const mockTimeSlots: TimeSlot[] = [
  { time: '08:30', label: '08:30-09:30', crowding: 'low', available: 12, recommended: true, estimatedWait: 5 },
  { time: '09:30', label: '09:30-10:30', crowding: 'medium', available: 5, recommended: false, estimatedWait: 20 },
  { time: '10:30', label: '10:30-11:30', crowding: 'high', available: 2, recommended: false, estimatedWait: 45 },
  { time: '11:30', label: '11:30-12:00', crowding: 'medium', available: 4, recommended: false, estimatedWait: 25 },
  { time: '14:00', label: '14:00-15:00', crowding: 'medium', available: 6, recommended: true, estimatedWait: 15 },
  { time: '15:00', label: '15:00-16:00', crowding: 'high', available: 1, recommended: false, estimatedWait: 50 },
  { time: '16:00', label: '16:00-17:00', crowding: 'low', available: 10, recommended: true, estimatedWait: 8 },
]

export const mockAppointments: Appointment[] = [
  { id: 'ap1', userId: '1', hallId: 'h1', hallName: '市政务服务中心', serviceType: '户籍迁移', appointmentDate: '2026-06-10', timeSlot: '09:30-10:30', status: 'booked' },
  { id: 'ap2', userId: '1', hallId: 'h2', hallName: '东区政务服务中心', serviceType: '不动产登记', appointmentDate: '2026-06-12', timeSlot: '14:00-15:00', status: 'booked' },
]

export const mockELicenses: ELicense[] = [
  { id: 'el1', userId: '1', type: '身份证', licenseNumber: 'EL-ID-320106199001011234', issueDate: '2024-01-15', expireDate: '2039-06-15', status: 'active', qrCode: 'QR-ID-001', shares: [] },
  { id: 'el2', userId: '1', type: '社保卡', licenseNumber: 'EL-SS-SH2020123456', issueDate: '2024-03-20', expireDate: '2050-03-01', status: 'active', qrCode: 'QR-SS-001', shares: [{ id: 'ls1', targetOrg: '市住房公积金管理中心', expireDate: '2026-07-01', createdAt: '2026-05-01', status: 'active' }] },
  { id: 'el3', userId: '1', type: '驾驶证', licenseNumber: 'EL-DL-DL3201061990010', issueDate: '2024-06-10', expireDate: '2027-09-10', status: 'active', qrCode: 'QR-DL-001', shares: [] },
  { id: 'el4', userId: '1', type: '居住证', licenseNumber: 'EL-JZ-JZ20230815001', issueDate: '2024-08-15', expireDate: '2025-08-15', status: 'expired', qrCode: 'QR-JZ-001', shares: [] },
]

export const mockEvaluations: Evaluation[] = [
  { id: 'ev1', userId: '1', applicationId: 'a1', serviceName: '社保查询', rating: 5, comment: '非常快捷，秒批！', createdAt: '2026-05-20T10:20:00' },
  { id: 'ev2', userId: '1', applicationId: 'a-prev1', serviceName: '公积金查询', rating: 4, comment: '查询方便，界面清晰', createdAt: '2026-04-15T16:00:00' },
  { id: 'ev3', userId: '1', applicationId: 'a-prev2', serviceName: '居住证办理', rating: 3, comment: '办理速度一般，等待时间较长', createdAt: '2026-03-20T11:30:00' },
]

export const mockDashboard: DashboardData = {
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
    { department: '市场监督管理局', total: 8200, avgTime: 3.8, satisfaction: 4.2 },
  ],
}

export const mockPredictions: PredictionData[] = [
  { month: '2026-04', actual: 11200, predicted: 10800 },
  { month: '2026-05', actual: 12500, predicted: 12000 },
  { month: '2026-06', actual: 13200, predicted: 12800 },
  { month: '2026-07', predicted: 14500 },
  { month: '2026-08', predicted: 13200 },
  { month: '2026-09', predicted: 15800 },
]

export const mockReports: ReportData[] = [
  { month: '2026-01', totalApplications: 9800, avgProcessingTime: 4.0, satisfaction: 4.2, timeoutCount: 156, categoryBreakdown: [{ category: '社保服务', count: 2800, avgTime: 2.0 }, { category: '住房服务', count: 2100, avgTime: 3.2 }, { category: '税务服务', count: 1800, avgTime: 4.0 }, { category: '户政服务', count: 1600, avgTime: 6.5 }, { category: '其他', count: 1500, avgTime: 4.5 }] },
  { month: '2026-02', totalApplications: 7600, avgProcessingTime: 4.3, satisfaction: 4.1, timeoutCount: 142, categoryBreakdown: [{ category: '社保服务', count: 2200, avgTime: 2.2 }, { category: '住房服务', count: 1600, avgTime: 3.5 }, { category: '税务服务', count: 1400, avgTime: 4.3 }, { category: '户政服务', count: 1200, avgTime: 7.0 }, { category: '其他', count: 1200, avgTime: 4.8 }] },
  { month: '2026-03', totalApplications: 10800, avgProcessingTime: 4.1, satisfaction: 4.3, timeoutCount: 178, categoryBreakdown: [{ category: '社保服务', count: 3000, avgTime: 2.0 }, { category: '住房服务', count: 2300, avgTime: 3.3 }, { category: '税务服务', count: 2000, avgTime: 4.1 }, { category: '户政服务', count: 1800, avgTime: 6.8 }, { category: '其他', count: 1700, avgTime: 4.6 }] },
  { month: '2026-04', totalApplications: 11200, avgProcessingTime: 4.2, satisfaction: 4.2, timeoutCount: 165, categoryBreakdown: [{ category: '社保服务', count: 3200, avgTime: 2.1 }, { category: '住房服务', count: 2400, avgTime: 3.4 }, { category: '税务服务', count: 2100, avgTime: 4.2 }, { category: '户政服务', count: 1900, avgTime: 6.6 }, { category: '其他', count: 1600, avgTime: 4.7 }] },
  { month: '2026-05', totalApplications: 12500, avgProcessingTime: 4.0, satisfaction: 4.4, timeoutCount: 152, categoryBreakdown: [{ category: '社保服务', count: 3500, avgTime: 1.9 }, { category: '住房服务', count: 2600, avgTime: 3.2 }, { category: '税务服务', count: 2200, avgTime: 4.0 }, { category: '户政服务', count: 2000, avgTime: 6.3 }, { category: '其他', count: 2200, avgTime: 4.4 }] },
]

export const mockAnnouncements = [
  { id: 'an1', title: '2026年度社保缴费基数调整通知', date: '2026-06-01', type: 'policy' },
  { id: 'an2', title: '公积金提取新政解读：租房提取额度提升', date: '2026-05-28', type: 'policy' },
  { id: 'an3', title: '市政务服务中心周末延时服务公告', date: '2026-05-25', type: 'notice' },
  { id: 'an4', title: '电子证照共享功能上线试运行', date: '2026-05-20', type: 'system' },
]
