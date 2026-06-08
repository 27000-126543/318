import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Inbox } from 'lucide-react'
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

function filterByTab(apps: Application[], tab: TabKey): Application[] {
  if (tab === 'all') return apps
  if (tab === 'processing') return apps.filter((a) => processingStatuses.includes(a.status))
  if (tab === 'supplement') return apps.filter((a) => a.status === 'supplement')
  if (tab === 'completed') return apps.filter((a) => a.status === 'approved')
  if (tab === 'rejected') return apps.filter((a) => a.status === 'rejected' || a.status === 'timeout')
  return apps
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export default function Applications() {
  const applications = useGovStore((s) => s.applications)
  const [activeTab, setActiveTab] = useState<TabKey>('all')

  const filtered = useMemo(() => filterByTab(applications, activeTab), [applications, activeTab])

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-gray-800 mb-6">我的办件</h1>

      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
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
