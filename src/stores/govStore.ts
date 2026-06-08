import { create } from 'zustand'
import {
  type Certificate, type ServiceItem, type Application,
  type Hall, type TimeSlot, type Appointment, type ELicense, type Evaluation,
  type DashboardData, type PredictionData, type ReportData, type Notification, type ActionRecord,
  mockCertificates, mockServices, mockApplications, mockHalls, mockTimeSlots,
  mockAppointments, mockELicenses, mockEvaluations, mockDashboard, mockPredictions,
  mockReports, mockAnnouncements,
} from '@/lib/mockData'

interface GovState {
  certificates: Certificate[]
  services: ServiceItem[]
  applications: Application[]
  halls: Hall[]
  timeSlots: TimeSlot[]
  appointments: Appointment[]
  eLicenses: ELicense[]
  evaluations: Evaluation[]
  dashboard: DashboardData
  predictions: PredictionData[]
  reports: ReportData[]
  announcements: typeof mockAnnouncements
  notifications: Notification[]
  unreadCount: number

  addCertificate: (cert: Omit<Certificate, 'id'>) => void
  removeCertificate: (id: string) => void
  getRecommendedServices: () => ServiceItem[]
  getServiceById: (id: string) => ServiceItem | undefined
  checkMaterials: (serviceId: string) => { material: ServiceItem['requiredMaterials'][0]; hasCert: boolean }[]
  submitApplication: (serviceId: string, formData: Record<string, string>) => string | null
  getApplicationById: (id: string) => Application | undefined
  supplementMaterials: (appId: string, materialIds: string[]) => void
  supplementSingleMaterial: (appId: string, materialId: string) => void

  approveNode: (appId: string, comment?: string) => void
  returnSupplement: (appId: string, comment: string) => void
  rejectApplication: (appId: string, comment: string) => void
  timeoutEscalation: (appId: string) => void

  getHallById: (id: string) => Hall | undefined
  bookAppointment: (hallId: string, serviceType: string, date: string, timeSlot: string) => void
  checkIn: (appointmentId: string) => void
  cancelAppointment: (id: string) => void

  applyELicense: (type: string) => void
  shareELicense: (licenseId: string, targetOrg: string, expireDate: string) => void
  renewELicense: (id: string) => void

  submitEvaluation: (applicationId: string, serviceName: string, rating: number, comment: string) => void
  getAvgRating: () => number

  addNotification: (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
  markNotificationRead: (id: string) => void
  markAllRead: () => void
  clearNotifications: () => void
}

const STORAGE_KEY = 'gov_data'
const DATA_VERSION_KEY = 'gov_data_version'
const CURRENT_VERSION = 3

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) return JSON.parse(data)
  } catch { /* ignore */ }
  return null
}

function saveToStorage(state: Partial<GovState>) {
  try {
    const toSave = {
      certificates: state.certificates,
      applications: state.applications,
      appointments: state.appointments,
      eLicenses: state.eLicenses,
      evaluations: state.evaluations,
      notifications: state.notifications,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    localStorage.setItem(DATA_VERSION_KEY, String(CURRENT_VERSION))
  } catch { /* ignore */ }
}

function migrateApplication(app: any): Application {
  if (app.approvalNodes && app.approvalNodes.length < 3) {
    const defaults = [
      { nodeName: '初审', nodeOrder: 1, assignee: '待分配', status: 'pending' as const, isTimeout: false, timeoutHours: 48 },
      { nodeName: '复核', nodeOrder: 2, assignee: '待分配', status: 'pending' as const, isTimeout: false, timeoutHours: 48 },
      { nodeName: '终审', nodeOrder: 3, assignee: '待分配', status: 'pending' as const, isTimeout: false, timeoutHours: 72 },
    ]
    while (app.approvalNodes.length < 3) {
      const idx = app.approvalNodes.length
      const def = defaults[idx]
      app.approvalNodes.push({ id: `n-mig-${app.id}-${idx}`, ...def })
    }
  }
  if (!app.actionRecords) {
    const records: ActionRecord[] = [{ id: `ar-mig-${app.id}`, action: 'submit', operator: '用户', createdAt: app.submittedAt }]
    if (app.approvalNodes) {
      app.approvalNodes.forEach((n: any) => {
        if (n.status === 'approved' && n.completedAt) {
          const isLastApproved = app.approvalNodes.filter((x: any) => x.status === 'approved').indexOf(n) === app.approvalNodes.filter((x: any) => x.status === 'approved').length - 1 && app.status === 'approved'
          records.push({ id: `ar-mig-${n.id}`, action: isLastApproved ? 'finalize' : 'approve', nodeName: n.nodeName, operator: n.assignee, comment: n.comment, createdAt: n.completedAt })
        } else if (n.status === 'rejected' && n.completedAt) {
          records.push({ id: `ar-mig-${n.id}`, action: 'return_supplement', nodeName: n.nodeName, operator: n.assignee, comment: n.comment, createdAt: n.completedAt })
        } else if (n.isTimeout && n.status === 'in_progress') {
          const timeoutDate = new Date(new Date(n.startedAt).getTime() + n.timeoutHours * 3600000).toISOString()
          records.push({ id: `ar-mig-${n.id}-to`, action: 'timeout_escalation', nodeName: n.nodeName, operator: '系统', comment: `${n.nodeName}已超${n.timeoutHours}小时未处理`, createdAt: timeoutDate })
        }
      })
    }
    app.actionRecords = records
  }
  return app as Application
}

function migrateData(stored: any): any {
  if (!stored) return stored
  const version = parseInt(localStorage.getItem(DATA_VERSION_KEY) || '0', 10)
  if (version >= CURRENT_VERSION) return stored
  if (stored.applications) {
    stored.applications = stored.applications.map(migrateApplication)
  }
  return stored
}

const rawStored = loadFromStorage()
const stored = migrateData(rawStored)

function addNotificationHelper(state: Partial<GovState>, n: Omit<Notification, 'id' | 'read' | 'createdAt'>) {
  const notification: Notification = { ...n, id: `nt${Date.now()}`, read: false, createdAt: new Date().toISOString() }
  const notifications = [notification, ...state.notifications!]
  const unreadCount = notifications.filter((x) => !x.read).length
  saveToStorage({ ...state, notifications })
  return { notifications, unreadCount }
}

export const useGovStore = create<GovState>((set, get) => ({
  certificates: stored?.certificates || [...mockCertificates],
  services: [...mockServices],
  applications: stored?.applications || [...mockApplications],
  halls: [...mockHalls],
  timeSlots: [...mockTimeSlots],
  appointments: stored?.appointments || [...mockAppointments],
  eLicenses: stored?.eLicenses || [...mockELicenses],
  evaluations: stored?.evaluations || [...mockEvaluations],
  dashboard: { ...mockDashboard },
  predictions: [...mockPredictions],
  reports: [...mockReports],
  announcements: [...mockAnnouncements],
  notifications: stored?.notifications || [
    { id: 'nt1', type: 'progress', title: '公积金提取正在复核中', applicationId: 'a2', serviceName: '公积金提取', read: true, createdAt: '2026-05-29T10:30:00' },
    { id: 'nt2', type: 'timeout', title: '驾驶证换证初审已超时，已升级通知', applicationId: 'a3', serviceName: '驾驶证换证', read: false, createdAt: '2026-06-03T11:00:00' },
    { id: 'nt3', type: 'supplement', title: '医保报销需要补充材料', applicationId: 'a4', serviceName: '医保报销', read: false, createdAt: '2026-05-27T09:20:00' },
    { id: 'nt4', type: 'approved', title: '社保查询已办结', applicationId: 'a1', serviceName: '社保查询', read: true, createdAt: '2026-05-20T10:15:00' },
  ],
  unreadCount: stored?.notifications ? stored.notifications.filter((n: Notification) => !n.read).length : 2,

  addCertificate: (cert) =>
    set((state) => {
      const certificates = [...state.certificates, { ...cert, id: `c${Date.now()}` }]
      saveToStorage({ ...state, certificates })
      return { certificates }
    }),

  removeCertificate: (id) =>
    set((state) => {
      const certificates = state.certificates.filter((c) => c.id !== id)
      saveToStorage({ ...state, certificates })
      return { certificates }
    }),

  getRecommendedServices: () => {
    const certs = get().certificates
    return get().services
      .map((s) => {
        const matchedMats = s.requiredMaterials.filter((m) => m.fromCertificate && certs.some((c) => c.type === m.fromCertificate && c.status === 'valid'))
        return { service: s, score: matchedMats.length / s.requiredMaterials.filter((m) => m.required).length }
      })
      .sort((a, b) => b.score - a.score || b.service.heat - a.service.heat)
      .slice(0, 6)
      .map((s) => s.service)
  },

  getServiceById: (id) => get().services.find((s) => s.id === id),

  checkMaterials: (serviceId) => {
    const service = get().getServiceById(serviceId)
    if (!service) return []
    const certs = get().certificates
    return service.requiredMaterials.map((m) => ({
      material: m,
      hasCert: m.fromCertificate ? certs.some((c) => c.type === m.fromCertificate && c.status === 'valid') : false,
    }))
  },

  submitApplication: (serviceId, formData) => {
    const service = get().getServiceById(serviceId)
    if (!service) return null
    const certs = get().certificates
    const materials = service.requiredMaterials.map((m) => ({
      materialId: m.id,
      name: m.name,
      uploaded: m.fromCertificate ? certs.some((c) => c.type === m.fromCertificate && c.status === 'valid') : false,
    }))
    const now = new Date().toISOString()
    const appId = `a${Date.now()}`
    const app: Application = {
      id: appId,
      userId: '1',
      serviceId,
      serviceName: service.name,
      category: service.category,
      department: service.department,
      status: 'first_review',
      formData,
      submittedAt: now,
      approvalNodes: [
        { id: `n${Date.now()}-1`, nodeName: '初审', nodeOrder: 1, assignee: '自动分配', status: 'in_progress', startedAt: now, isTimeout: false, timeoutHours: 48 },
        { id: `n${Date.now()}-2`, nodeName: '复核', nodeOrder: 2, assignee: '待分配', status: 'pending', isTimeout: false, timeoutHours: 48 },
        { id: `n${Date.now()}-3`, nodeName: '终审', nodeOrder: 3, assignee: '待分配', status: 'pending', isTimeout: false, timeoutHours: 72 },
      ],
      materials,
      actionRecords: [{ id: `ar${Date.now()}`, action: 'submit', operator: '用户', createdAt: now }],
    }
    set((state) => {
      const applications = [app, ...state.applications]
      const nResult = addNotificationHelper(state, { type: 'submitted', title: `${service.name}申请已提交`, applicationId: appId, serviceName: service.name })
      return { applications, ...nResult }
    })
    return appId
  },

  getApplicationById: (id) => get().applications.find((a) => a.id === id),

  supplementMaterials: (appId, materialIds) =>
    set((state) => {
      const targetApp = state.applications.find((a) => a.id === appId)
      const now = new Date().toISOString()
      const applications = state.applications.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'first_review' as const,
              materials: a.materials.map((m) =>
                materialIds.includes(m.materialId) ? { ...m, uploaded: true } : m
              ),
              approvalNodes: a.approvalNodes.map((n, i) => {
                if (i === 0) return { ...n, status: 'in_progress' as const, startedAt: now, comment: undefined, isTimeout: false }
                return { ...n, status: 'pending' as const }
              }),
              actionRecords: [
                ...a.actionRecords,
                { id: `ar${Date.now()}`, action: 'resubmit' as const, operator: '用户', comment: '已补充全部缺失材料', createdAt: now },
              ],
            }
          : a
      )
      const nResult = addNotificationHelper({ ...state, applications }, { type: 'supplement', title: `${targetApp?.serviceName || '办件'}材料已补充，重新进入初审`, applicationId: appId, serviceName: targetApp?.serviceName || '' })
      saveToStorage({ ...state, applications, notifications: nResult.notifications })
      return { applications, ...nResult }
    }),

  supplementSingleMaterial: (appId, materialId) =>
    set((state) => {
      const targetApp = state.applications.find((a) => a.id === appId)
      const mat = targetApp?.materials.find((m) => m.materialId === materialId)
      const now = new Date().toISOString()
      const applications = state.applications.map((a) =>
        a.id === appId
          ? {
              ...a,
              materials: a.materials.map((m) => m.materialId === materialId ? { ...m, uploaded: true } : m),
              actionRecords: [...a.actionRecords, { id: `ar${Date.now()}`, action: 'upload_material' as const, operator: '用户', materialName: mat?.name, createdAt: now }],
            }
          : a
      )
      saveToStorage({ ...state, applications })
      return { applications }
    }),

  approveNode: (appId, comment) =>
    set((state) => {
      const app = state.applications.find((a) => a.id === appId)
      if (!app) return state
      const now = new Date().toISOString()
      const activeIdx = app.approvalNodes.findIndex((n) => n.status === 'in_progress')
      if (activeIdx === -1) return state
      const isLast = activeIdx === app.approvalNodes.length - 1
      const isFinalNode = isLast
      const applications = state.applications.map((a) => {
        if (a.id !== appId) return a
        const nodes = a.approvalNodes.map((n, i) => {
          if (i === activeIdx) return { ...n, status: 'approved' as const, completedAt: now, comment }
          if (i === activeIdx + 1) return { ...n, status: 'in_progress' as const, startedAt: now, assignee: '自动分配' }
          return n
        })
        const newStatus: Application['status'] = isFinalNode ? 'approved' : (activeIdx === 0 ? 're_review' : 'final_review')
        return {
          ...a,
          status: newStatus,
          approvalNodes: nodes,
          completedAt: isFinalNode ? now : undefined,
          actionRecords: [...a.actionRecords, { id: `ar${Date.now()}`, action: (isFinalNode ? 'finalize' : 'approve') as ActionRecord['action'], nodeName: a.approvalNodes[activeIdx].nodeName, operator: a.approvalNodes[activeIdx].assignee, comment, createdAt: now }],
        }
      })
      const updatedApp = applications.find((a) => a.id === appId)!
      const nType: Notification['type'] = isFinalNode ? 'approved' : 'progress'
      const nTitle = isFinalNode ? `${app.serviceName}已办结` : `${app.serviceName}${app.approvalNodes[activeIdx].nodeName}已通过`
      const nResult = addNotificationHelper({ ...state, applications }, { type: nType, title: nTitle, applicationId: appId, serviceName: app.serviceName })
      saveToStorage({ ...state, applications, notifications: nResult.notifications })
      return { applications, ...nResult }
    }),

  returnSupplement: (appId, comment) =>
    set((state) => {
      const app = state.applications.find((a) => a.id === appId)
      if (!app) return state
      const now = new Date().toISOString()
      const activeIdx = app.approvalNodes.findIndex((n) => n.status === 'in_progress')
      if (activeIdx === -1) return state
      const applications = state.applications.map((a) => {
        if (a.id !== appId) return a
        const nodes = a.approvalNodes.map((n, i) => {
          if (i === activeIdx) return { ...n, status: 'rejected' as const, completedAt: now, comment }
          return { ...n, status: 'pending' as const }
        })
        return {
          ...a,
          status: 'supplement' as const,
          approvalNodes: nodes,
          actionRecords: [...a.actionRecords, { id: `ar${Date.now()}`, action: 'return_supplement' as const, nodeName: a.approvalNodes[activeIdx].nodeName, operator: a.approvalNodes[activeIdx].assignee, comment, createdAt: now }],
        }
      })
      const nResult = addNotificationHelper({ ...state, applications }, { type: 'supplement', title: `${app.serviceName}需要补充材料`, applicationId: appId, serviceName: app.serviceName })
      saveToStorage({ ...state, applications, notifications: nResult.notifications })
      return { applications, ...nResult }
    }),

  rejectApplication: (appId, comment) =>
    set((state) => {
      const app = state.applications.find((a) => a.id === appId)
      if (!app) return state
      const now = new Date().toISOString()
      const activeIdx = app.approvalNodes.findIndex((n) => n.status === 'in_progress')
      if (activeIdx === -1) return state
      const applications = state.applications.map((a) => {
        if (a.id !== appId) return a
        const nodes = a.approvalNodes.map((n, i) => {
          if (i === activeIdx) return { ...n, status: 'rejected' as const, completedAt: now, comment }
          return n
        })
        return {
          ...a,
          status: 'rejected' as const,
          approvalNodes: nodes,
          completedAt: now,
          actionRecords: [...a.actionRecords, { id: `ar${Date.now()}`, action: 'reject' as const, nodeName: a.approvalNodes[activeIdx].nodeName, operator: a.approvalNodes[activeIdx].assignee, comment, createdAt: now }],
        }
      })
      const nResult = addNotificationHelper({ ...state, applications }, { type: 'rejected', title: `${app.serviceName}申请已驳回`, applicationId: appId, serviceName: app.serviceName })
      saveToStorage({ ...state, applications, notifications: nResult.notifications })
      return { applications, ...nResult }
    }),

  timeoutEscalation: (appId) =>
    set((state) => {
      const app = state.applications.find((a) => a.id === appId)
      if (!app) return state
      const now = new Date().toISOString()
      const activeIdx = app.approvalNodes.findIndex((n) => n.status === 'in_progress')
      if (activeIdx === -1) return state
      const applications = state.applications.map((a) => {
        if (a.id !== appId) return a
        const nodes = a.approvalNodes.map((n, i) => {
          if (i === activeIdx) return { ...n, isTimeout: true }
          return n
        })
        return {
          ...a,
          status: 'timeout' as const,
          approvalNodes: nodes,
          actionRecords: [...a.actionRecords, { id: `ar${Date.now()}`, action: 'timeout_escalation' as const, nodeName: a.approvalNodes[activeIdx].nodeName, operator: '系统', comment: `${a.approvalNodes[activeIdx].nodeName}已超时，已升级通知上级主管`, createdAt: now }],
        }
      })
      const nResult = addNotificationHelper({ ...state, applications }, { type: 'timeout', title: `${app.serviceName}审批超时，已升级通知`, applicationId: appId, serviceName: app.serviceName })
      saveToStorage({ ...state, applications, notifications: nResult.notifications })
      return { applications, ...nResult }
    }),

  getHallById: (id) => get().halls.find((h) => h.id === id),

  bookAppointment: (hallId, serviceType, date, timeSlot) => {
    const hall = get().getHallById(hallId)
    if (!hall) return
    const apt: Appointment = {
      id: `ap${Date.now()}`,
      userId: '1',
      hallId,
      hallName: hall.name,
      serviceType,
      appointmentDate: date,
      timeSlot,
      status: 'booked',
    }
    set((state) => {
      const appointments = [apt, ...state.appointments]
      saveToStorage({ ...state, appointments })
      return { appointments }
    })
  },

  checkIn: (appointmentId) =>
    set((state) => {
      const appointments = state.appointments.map((a) =>
        a.id === appointmentId
          ? { ...a, status: 'checked_in' as const, queueNumber: Math.floor(Math.random() * 50) + 100 }
          : a
      )
      saveToStorage({ ...state, appointments })
      return { appointments }
    }),

  cancelAppointment: (id) =>
    set((state) => {
      const appointments = state.appointments.map((a) =>
        a.id === id ? { ...a, status: 'cancelled' as const } : a
      )
      saveToStorage({ ...state, appointments })
      return { appointments }
    }),

  applyELicense: (type) =>
    set((state) => {
      const eLicenses = [
        ...state.eLicenses,
        {
          id: `el${Date.now()}`,
          userId: '1',
          type,
          licenseNumber: `EL-${type}-${Date.now()}`,
          issueDate: new Date().toISOString().split('T')[0],
          expireDate: new Date(Date.now() + 365 * 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending' as const,
          qrCode: `QR-${Date.now()}`,
          shares: [],
        },
      ]
      saveToStorage({ ...state, eLicenses })
      return { eLicenses }
    }),

  shareELicense: (licenseId, targetOrg, expireDate) =>
    set((state) => {
      const eLicenses = state.eLicenses.map((l) =>
        l.id === licenseId
          ? {
              ...l,
              shares: [
                ...l.shares,
                { id: `ls${Date.now()}`, targetOrg, expireDate, createdAt: new Date().toISOString(), status: 'active' as const },
              ],
            }
          : l
      )
      saveToStorage({ ...state, eLicenses })
      return { eLicenses }
    }),

  renewELicense: (id) =>
    set((state) => {
      const eLicenses = state.eLicenses.map((l) =>
        l.id === id ? { ...l, status: 'renewing' as const } : l
      )
      saveToStorage({ ...state, eLicenses })
      return { eLicenses }
    }),

  submitEvaluation: (applicationId, serviceName, rating, comment) =>
    set((state) => {
      const evaluations = [
        ...state.evaluations,
        {
          id: `ev${Date.now()}`,
          userId: '1',
          applicationId,
          serviceName,
          rating,
          comment,
          createdAt: new Date().toISOString(),
        },
      ]
      saveToStorage({ ...state, evaluations })
      return { evaluations }
    }),

  getAvgRating: () => {
    const evs = get().evaluations
    if (evs.length === 0) return 0
    return evs.reduce((sum, e) => sum + e.rating, 0) / evs.length
  },

  addNotification: (n) =>
    set((state) => {
      const result = addNotificationHelper(state, n)
      return result
    }),

  markNotificationRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
      const unreadCount = notifications.filter((n) => !n.read).length
      saveToStorage({ ...state, notifications })
      return { notifications, unreadCount }
    }),

  markAllRead: () =>
    set((state) => {
      const notifications = state.notifications.map((n) => ({ ...n, read: true }))
      saveToStorage({ ...state, notifications })
      return { notifications, unreadCount: 0 }
    }),

  clearNotifications: () =>
    set((state) => {
      saveToStorage({ ...state, notifications: [] })
      return { notifications: [], unreadCount: 0 }
    }),
}))
