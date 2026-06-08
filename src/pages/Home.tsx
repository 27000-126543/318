import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  ShieldAlert,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  Building2,
  Receipt,
  Home as HomeIcon,
  Car,
  Stethoscope,
  Sparkles,
  Flame,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useGovStore } from '@/stores/govStore'
import type { Application } from '@/lib/mockData'

const quickAccessItems = [
  { id: 's1', label: '社保查询', icon: HeartPulse, color: 'text-govBlue' },
  { id: 's2', label: '公积金提取', icon: Building2, color: 'text-govOrange' },
  { id: 's3', label: '税务申报', icon: Receipt, color: 'text-govGreen' },
  { id: 's4', label: '户籍迁移', icon: HomeIcon, color: 'text-govPurple' },
  { id: 's5', label: '驾驶证换证', icon: Car, color: 'text-govRed' },
  { id: 's7', label: '医保报销', icon: Stethoscope, color: 'text-govBlue' },
]

const statusLabels: Record<Application['status'], string> = {
  submitted: '已提交',
  first_review: '初审中',
  re_review: '复核中',
  final_review: '终审中',
  supplement: '待补充材料',
  approved: '已通过',
  rejected: '已驳回',
  timeout: '超时',
}

const statusColors: Record<Application['status'], string> = {
  submitted: 'bg-gray-100 text-gray-600',
  first_review: 'bg-blue-100 text-blue-700',
  re_review: 'bg-blue-100 text-blue-700',
  final_review: 'bg-purple-100 text-purple-700',
  supplement: 'bg-govOrange/10 text-govOrange',
  approved: 'bg-govGreen/10 text-govGreen',
  rejected: 'bg-govRed/10 text-govRed',
  timeout: 'bg-govRed/10 text-govRed',
}

function AnnouncementsCarousel() {
  const { announcements } = useGovStore()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % announcements.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [announcements.length])

  const prev = () => setCurrent((c) => (c - 1 + announcements.length) % announcements.length)
  const next = () => setCurrent((c) => (c + 1) % announcements.length)

  const typeLabels: Record<string, string> = { policy: '政策', notice: '公告', system: '系统' }

  return (
    <div className="gov-card">
      <div className="mb-3 flex items-center gap-2">
        <Megaphone className="h-5 w-5 text-govOrange" />
        <h3 className="font-serif text-base font-semibold">政务公告</h3>
      </div>
      <div className="relative overflow-hidden">
        <div className="transition-all duration-300" style={{ transform: `translateY(-${current * 52}px)` }}>
          {announcements.map((a) => (
            <div key={a.id} className="flex h-[52px] items-center gap-3">
              <span className={cn('gov-badge', a.type === 'policy' ? 'bg-govBlue/10 text-govBlue' : a.type === 'notice' ? 'bg-govOrange/10 text-govOrange' : 'bg-govGreen/10 text-govGreen')}>
                {typeLabels[a.type] || a.type}
              </span>
              <span className="flex-1 truncate text-sm text-gray-700">{a.title}</span>
              <span className="shrink-0 text-xs text-gray-400">{a.date}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex gap-1.5">
          {announcements.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={cn('h-1.5 rounded-full transition-all', i === current ? 'w-4 bg-govBlue' : 'w-1.5 bg-gray-300')} />
          ))}
        </div>
        <div className="flex gap-1">
          <button onClick={prev} className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-gray-100"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={next} className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-gray-100"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { user } = useAuthStore()
  const { applications, getRecommendedServices, notifications } = useGovStore()
  const recentNotifications = notifications.filter((n) => !n.read).slice(0, 3)
  const recommended = getRecommendedServices()

  const activeApps = applications.filter((a) => a.status !== 'approved' && a.status !== 'rejected')

  const stats = {
    done: applications.filter((a) => a.status === 'approved').length,
    inProgress: activeApps.filter((a) => a.status !== 'supplement').length,
    supplement: applications.filter((a) => a.status === 'supplement').length,
  }

  const getCurrentNode = (app: Application) => {
    const node = app.approvalNodes.find((n) => n.status === 'in_progress')
    return node?.nodeName || '待处理'
  }

  const getRecommendTag = (serviceId: string) => {
    const { certificates, services } = useGovStore.getState()
    const service = services.find((s) => s.id === serviceId)
    if (!service) return null
    const hasAllCerts = service.requiredMaterials
      .filter((m) => m.fromCertificate)
      .every((m) => certificates.some((c) => c.type === m.fromCertificate && c.status === 'valid'))
    if (hasAllCerts) return { text: '证件齐全', color: 'bg-govGreen/10 text-govGreen' }
    if (service.heat >= 85) return { text: '热门事项', color: 'bg-govOrange/10 text-govOrange' }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="gov-card bg-gradient-to-r from-govBlue to-govBlue/80 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold">
              {user?.name ? `${user.name}，您好！` : '您好！'}
            </h2>
            <p className="mt-1 text-sm text-white/80">欢迎使用智慧政务服务平台</p>
          </div>
          <Link to="/auth/realname" className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm hover:bg-white/30">
            {user?.realNameVerified ? (
              <><ShieldCheck className="h-4 w-4" /><span>已实名</span></>
            ) : (
              <><ShieldAlert className="h-4 w-4" /><span>未实名</span></>
            )}
          </Link>
        </div>
      </div>

      <AnnouncementsCarousel />

      <div className="gov-card">
        <h3 className="mb-4 font-serif text-base font-semibold">快捷服务</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {quickAccessItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.id} to={`/services/${item.id}`} className="flex flex-col items-center gap-2 rounded-lg border border-gray-100 p-4 transition-shadow hover:shadow-md">
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50', item.color)}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="gov-card">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-govOrange" />
          <h3 className="font-serif text-base font-semibold">智能推荐</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recommended.slice(0, 6).map((service) => {
            const tag = getRecommendTag(service.id)
            return (
              <Link key={service.id} to={`/services/${service.id}`} className="group rounded-lg border border-gray-100 p-4 transition-shadow hover:shadow-md">
                <div className="mb-2 flex items-start justify-between">
                  <h4 className="text-sm font-medium text-gray-800 group-hover:text-govBlue">{service.name}</h4>
                  {service.heat >= 85 && <Flame className="h-4 w-4 text-govOrange" />}
                </div>
                <p className="mb-3 line-clamp-2 text-xs text-gray-500">{service.description}</p>
                <div className="flex items-center gap-2">
                  {tag && <span className={cn('gov-badge text-[10px]', tag.color)}>{tag.text}</span>}
                  <span className="text-xs text-gray-400">平均{service.avgProcessingDays}个工作日</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {activeApps.length > 0 && (
        <div className="gov-card">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-govBlue" />
            <h3 className="font-serif text-base font-semibold">在办事项</h3>
          </div>
          <div className="space-y-3">
            {activeApps.map((app) => (
              <Link key={app.id} to={`/applications/${app.id}`} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition-shadow hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-govBlue" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{app.serviceName}</p>
                    <p className="text-xs text-gray-400">当前节点：{getCurrentNode(app)}</p>
                  </div>
                </div>
                <span className={cn('gov-badge', statusColors[app.status])}>{statusLabels[app.status]}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recentNotifications.length > 0 && (
        <div className="gov-card">
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-govRed" />
            <h3 className="font-serif text-base font-semibold">最新通知</h3>
          </div>
          <div className="space-y-2">
            {recentNotifications.map((n) => {
              const statusMap: Record<string, string> = { submitted: 'first_review', progress: 're_review', supplement: 'supplement', timeout: 'timeout', approved: 'approved', rejected: 'rejected' }
              const qs = statusMap[n.type] ? `?status=${statusMap[n.type]}` : ''
              return (
              <Link key={n.id} to={`/applications/${n.applicationId}${qs}`} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition-shadow hover:shadow-sm">
                <div className={cn('h-2 w-2 rounded-full shrink-0', n.type === 'timeout' || n.type === 'rejected' ? 'bg-govRed' : n.type === 'supplement' ? 'bg-govOrange' : 'bg-govBlue')} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{n.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{n.serviceName}</p>
                </div>
                <FileText className="h-4 w-4 text-gray-300 shrink-0" />
              </Link>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="gov-card flex flex-col items-center py-4">
          <CheckCircle2 className="mb-1 h-6 w-6 text-govGreen" />
          <span className="text-2xl font-bold text-gray-800">{stats.done}</span>
          <span className="text-xs text-gray-500">已办结</span>
        </div>
        <div className="gov-card flex flex-col items-center py-4">
          <Clock className="mb-1 h-6 w-6 text-govBlue" />
          <span className="text-2xl font-bold text-gray-800">{stats.inProgress}</span>
          <span className="text-xs text-gray-500">办理中</span>
        </div>
        <div className="gov-card flex flex-col items-center py-4">
          <AlertCircle className="mb-1 h-6 w-6 text-govOrange" />
          <span className="text-2xl font-bold text-gray-800">{stats.supplement}</span>
          <span className="text-xs text-gray-500">待补充材料</span>
        </div>
      </div>
    </div>
  )
}
