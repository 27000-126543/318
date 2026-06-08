import { create } from 'zustand'
import {
  type Certificate, type ServiceItem, type Application,
  type Hall, type TimeSlot, type Appointment, type ELicense, type Evaluation,
  type DashboardData, type PredictionData, type ReportData,
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

  addCertificate: (cert: Omit<Certificate, 'id'>) => void
  removeCertificate: (id: string) => void
  getRecommendedServices: () => ServiceItem[]
  getServiceById: (id: string) => ServiceItem | undefined
  checkMaterials: (serviceId: string) => { material: ServiceItem['requiredMaterials'][0]; hasCert: boolean }[]
  submitApplication: (serviceId: string, formData: Record<string, string>) => string | null
  getApplicationById: (id: string) => Application | undefined
  supplementMaterials: (appId: string, materialIds: string[]) => void

  getHallById: (id: string) => Hall | undefined
  bookAppointment: (hallId: string, serviceType: string, date: string, timeSlot: string) => void
  checkIn: (appointmentId: string) => void
  cancelAppointment: (id: string) => void

  applyELicense: (type: string) => void
  shareELicense: (licenseId: string, targetOrg: string, expireDate: string) => void
  renewELicense: (id: string) => void

  submitEvaluation: (applicationId: string, serviceName: string, rating: number, comment: string) => void
  getAvgRating: () => number
}

const STORAGE_KEY = 'gov_data'

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
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch { /* ignore */ }
}

const stored = loadFromStorage()

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
    }
    set((state) => {
      const applications = [app, ...state.applications]
      saveToStorage({ ...state, applications })
      return { applications }
    })
    return appId
  },

  getApplicationById: (id) => get().applications.find((a) => a.id === id),

  supplementMaterials: (appId, materialIds) =>
    set((state) => {
      const applications = state.applications.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'first_review' as const,
              materials: a.materials.map((m) =>
                materialIds.includes(m.materialId) ? { ...m, uploaded: true } : m
              ),
              approvalNodes: a.approvalNodes.map((n, i) =>
                i === 0 ? { ...n, status: 'in_progress' as const, startedAt: new Date().toISOString() } : n
              ),
            }
          : a
      )
      saveToStorage({ ...state, applications })
      return { applications }
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
}))
