import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, CheckCheck, Trash2, FileText, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useGovStore } from '@/stores/govStore'
import { cn } from '@/lib/utils'
import type { Notification } from '@/lib/mockData'

const typeIcons: Record<Notification['type'], typeof Bell> = {
  submitted: FileText,
  supplement: AlertCircle,
  timeout: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  progress: FileText,
}

const typeColors: Record<Notification['type'], string> = {
  submitted: 'text-govBlue',
  supplement: 'text-govOrange',
  timeout: 'text-govRed',
  approved: 'text-govGreen',
  rejected: 'text-govRed',
  progress: 'text-govBlue',
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

export default function NotificationBell() {
  const navigate = useNavigate()
  const notifications = useGovStore((s) => s.notifications)
  const unreadCount = useGovStore((s) => s.unreadCount)
  const markNotificationRead = useGovStore((s) => s.markNotificationRead)
  const markAllRead = useGovStore((s) => s.markAllRead)
  const clearNotifications = useGovStore((s) => s.clearNotifications)

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleClick = (n: Notification) => {
    if (!n.read) markNotificationRead(n.id)
    setOpen(false)
    const statusMap: Record<string, string> = { submitted: 'first_review', progress: 're_review', supplement: 'supplement', timeout: 'timeout', approved: 'approved', rejected: 'rejected' }
    const status = statusMap[n.type] || ''
    navigate(`/applications/${n.applicationId}${status ? `?status=${status}` : ''}`)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-govRed px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-gray-200 bg-white shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-serif text-sm font-semibold text-gray-800">消息通知</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-govBlue hover:underline">
                  <CheckCheck className="h-3.5 w-3.5" />
                  全部已读
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearNotifications} className="flex items-center gap-1 text-xs text-gray-400 hover:text-govRed">
                  <Trash2 className="h-3.5 w-3.5" />
                  清空
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">暂无通知</div>
            ) : (
              notifications.map((n) => {
                const Icon = typeIcons[n.type]
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0',
                      !n.read && 'bg-govBlue/5'
                    )}
                  >
                    <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', typeColors[n.type])} />
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm leading-snug', !n.read ? 'font-medium text-gray-800' : 'text-gray-600')}>
                        {n.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{n.serviceName}</span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{formatTime(n.createdAt)}</span>
                      </div>
                    </div>
                    {!n.read && <div className="h-2 w-2 rounded-full bg-govBlue shrink-0 mt-2" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
