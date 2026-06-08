import { useMemo, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FileText, Inbox, Search, RotateCcw, ChevronDown } from 'lucide-react'
import { useGovStore } from '@/stores/govStore'
import { cn } from '@/lib/utils'
import type { Application } from '@/lib/mockData'

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'processing', label: '办理中' },
  { key: 'supplement', label: '待补充' },
  { key: 'completed', label: '已办结' },
  { key: 'rejected', label: '已驳回' },
] as const

type TabKey = (typeof tabs)[number]['key']

const statusOptions: { value: string; label: string }[] = [
  { value: '', label: '全部' },
  { value: 'submitted', label: '已提交' },
  { value: 'first_review', label: '初审中' },
  { value: 're_review', label: '复核中' },
  { value: 'final_review', label: '终审中' },
  { value: 'supplement', label: '待补充材料' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已驳回' },
  { value: 'timeout', label: '已超时' },
]

const statusLabels: Record<Application['status'], string> = {
  submitted: '已提交',
  first_review: '初审中',
  re_review: '复核中',
  final_review: '终审中',
  supplement: '待补充材料',
  approved: '已通过',
  rejected: '已驳回',
  timeout: '已超时',
}

const statusColors: Record<Application['status'], string> = {
  submitted: 'bg-gray-100 text-gray-600 border-gray-200',
  first_review: 'bg-govBlue/10 text-govBlue border-govBlue/20',
  re_review: 'bg-govBlue/10 text-govBlue border-govBlue/20',
  final_review: 'bg-govPurple/10 text-govPurple border-govPurple/20',
  supplement: 'bg-govOrange/10 text-govOrange border-govOrange/20',
  approved: 'bg-govGreen/10 text-govGreen border-govGreen/20',
  rejected: 'bg-govRed/10 text-govRed border-govRed/20',
  timeout: 'bg-govRed/10 text-govRed border-govRed/20',
}

const processingStatuses: Application['status'][] = ['submitted', 'first_review', 're_review', 'final_review']

function tabToStatuses(tab: TabKey): Application['status'][] | null {
  if (tab === 'all') return null
  if (tab === 'processing') return processingStatuses
  if (tab === 'supplement') return ['supplement']
  if (tab === 'completed') return ['approved']
  if (tab === 'rejected') return ['rejected', 'timeout']
  return null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export default function Applications() {
  const applications = useGovStore((s) => s.applications)
  const [searchParams, setSearchParams] = useSearchParams()

  const q = searchParams.get('q') || ''
  const statusFilter = searchParams.get('status') || ''
  const deptFilter = searchParams.get('dept') || ''
  const dateFrom = searchParams.get('dateFrom') || ''
  const dateTo = searchParams.get('dateTo') || ''
  const tabParam = searchParams.get('tab') as TabKey | null
  const activeTab: TabKey = tabs.some((t) => t.key === tabParam) ? tabParam! : 'all'

  const departments = useMemo(() => {
    const set = new Set(applications.map((a) => a.department))
    return ['全部', ...Array.from(set).sort()]
  }, [applications])

  const updateParam = useCallback(
    (key: string, value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      })
    },
    [setSearchParams]
  )

  const handleTabChange = useCallback(
    (tab: TabKey) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set('tab', tab)
        next.delete('status')
        return next
      })
    },
    [setSearchParams]
  )

  const handleReset = useCallback(() => {
    setSearchParams({})
  }, [setSearchParams])

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      if (q && !app.serviceName.includes(q)) return false

      const effectiveStatus = statusFilter
      if (effectiveStatus && app.status !== effectiveStatus) return false

      if (!statusFilter && activeTab !== 'all') {
        const tabStatuses = tabToStatuses(activeTab)
        if (tabStatuses && !tabStatuses.includes(app.status)) return false
      }

      if (deptFilter && deptFilter !== '全部' && app.department !== deptFilter) return false

      if (dateFrom) {
        const from = new Date(dateFrom)
        const submitted = new Date(app.submittedAt)
        if (submitted < from) return false
      }
      if (dateTo) {
        const to = new Date(dateTo)
        to.setHours(23, 59, 59, 999)
        const submitted = new Date(app.submittedAt)
        if (submitted > to) return false
      }

      return true
    })
  }, [applications, q, statusFilter, deptFilter, dateFrom, dateTo, activeTab])

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-gray-800 mb-6">我的办件</h1>

      <div className="gov-card mb-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => updateParam('q', e.target.value)}
              placeholder="搜索服务名称"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-govBlue/40 focus:border-govBlue/40"
            />
          </div>

          <div className="relative min-w-[140px]">
            <select
              value={statusFilter}
              onChange={(e) => updateParam('status', e.target.value)}
              className="w-full appearance-none px-3 py-2 pr-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-govBlue/40 focus:border-govBlue/40 bg-white"
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative min-w-[160px]">
            <select
              value={deptFilter}
              onChange={(e) => updateParam('dept', e.target.value)}
              className="w-full appearance-none px-3 py-2 pr-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-govBlue/40 focus:border-govBlue/40 bg-white"
            >
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => updateParam('dateFrom', e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-govBlue/40 focus:border-govBlue/40"
          />
          <span className="self-center text-gray-400 text-sm">至</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => updateParam('dateTo', e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-govBlue/40 focus:border-govBlue/40"
          />

          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-govBlue border border-gray-200 rounded-lg hover:border-govBlue/30 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            重置
          </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={cn(
              'shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
              activeTab === tab.key
                ? 'border-govBlue text-govBlue'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-4">共 {filtered.length} 条记录</p>

      {filtered.length === 0 ? (
        <div className="gov-card text-center py-16">
          <Inbox className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">暂无相关办件</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <Link
              key={app.id}
              to={`/applications/${app.id}`}
              className="gov-card group hover:shadow-md hover:border-govBlue/20 transition-all duration-200 flex items-center gap-4 block"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-govBlue/10 shrink-0">
                <FileText className="h-5 w-5 text-govBlue" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-govBlue transition-colors truncate">
                  {app.serviceName}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{app.department}</p>
              </div>

              <div className="text-right shrink-0">
                <span className={cn('gov-badge border', statusColors[app.status])}>
                  {statusLabels[app.status]}
                </span>
                <p className="text-xs text-gray-400 mt-1.5">{formatDate(app.submittedAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
