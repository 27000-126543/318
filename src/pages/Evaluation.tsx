import { useState } from 'react'
import { Star, MessageSquare, BarChart3, CheckCircle2 } from 'lucide-react'
import { useGovStore } from '@/stores/govStore'
import { cn } from '@/lib/utils'

function StarRating({
  rating,
  interactive,
  onChange,
}: {
  rating: number
  interactive?: boolean
  onChange?: (r: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            'h-5 w-5 transition-colors',
            interactive ? 'cursor-pointer' : '',
            n <= (hovered || rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-200'
          )}
          onMouseEnter={() => interactive && setHovered(n)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onChange?.(n)}
        />
      ))}
    </div>
  )
}

function SatisfactionSummary() {
  const { evaluations, getAvgRating } = useGovStore()
  const avgRating = getAvgRating()
  const total = evaluations.length

  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = evaluations.filter((e) => e.rating === stars).length
    return { stars, count, percentage: total > 0 ? (count / total) * 100 : 0 }
  })

  return (
    <div className="gov-card">
      <h2 className="text-lg font-serif font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-govBlue" />
        满意度总览
      </h2>
      <div className="flex items-start gap-8">
        <div className="text-center">
          <div className="text-4xl font-bold text-govBlue">{avgRating.toFixed(1)}</div>
          <StarRating rating={Math.round(avgRating)} />
          <div className="text-sm text-gray-400 mt-1">{total} 条评价</div>
        </div>
        <div className="flex-1 space-y-2">
          {distribution.map((d) => (
            <div key={d.stars} className="flex items-center gap-2">
              <span className="text-sm text-gray-500 w-12 shrink-0">{d.stars}星</span>
              <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{ width: `${d.percentage}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-8 text-right">{d.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PendingEvaluations() {
  const { applications, evaluations, submitEvaluation } = useGovStore()
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [comments, setComments] = useState<Record<string, string>>({})
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set())

  const evaluatedAppIds = new Set(evaluations.map((e) => e.applicationId))
  const pendingApps = applications.filter(
    (a) => a.status === 'approved' && !evaluatedAppIds.has(a.id)
  )

  const handleSubmit = (appId: string, serviceName: string) => {
    const rating = ratings[appId] || 0
    const comment = comments[appId] || ''
    if (rating === 0) return
    submitEvaluation(appId, serviceName, rating, comment)
    setSubmittedIds((prev) => new Set(prev).add(appId))
  }

  if (pendingApps.length === 0) {
    return (
      <div className="gov-card py-12 text-center text-gray-400">
        <CheckCircle2 className="mx-auto h-12 w-12 mb-3 opacity-30" />
        <p>暂无待评价事项</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {pendingApps.map((app) => {
        const isSubmitted = submittedIds.has(app.id)
        return (
          <div key={app.id} className="gov-card !p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-gray-800">{app.serviceName}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {app.department} · 完成于 {app.completedAt?.split('T')[0] || '—'}
                </p>
              </div>
              {isSubmitted && (
                <span className="gov-badge bg-govGreen/10 text-govGreen">已评价</span>
              )}
            </div>
            {!isSubmitted && (
              <>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">满意度评分</label>
                  <StarRating
                    rating={ratings[app.id] || 0}
                    interactive
                    onChange={(r) => setRatings((prev) => ({ ...prev, [app.id]: r }))}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">评价内容</label>
                  <textarea
                    className="gov-input resize-none"
                    rows={3}
                    placeholder="请输入您的评价..."
                    value={comments[app.id] || ''}
                    onChange={(e) =>
                      setComments((prev) => ({ ...prev, [app.id]: e.target.value }))
                    }
                  />
                </div>
                <button
                  className={cn(
                    'gov-btn-primary text-sm',
                    !ratings[app.id] && 'opacity-50 cursor-not-allowed'
                  )}
                  disabled={!ratings[app.id]}
                  onClick={() => handleSubmit(app.id, app.serviceName)}
                >
                  提交评价
                </button>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

function HistoricalEvaluations() {
  const { evaluations } = useGovStore()

  if (evaluations.length === 0) {
    return (
      <div className="gov-card py-12 text-center text-gray-400">
        <MessageSquare className="mx-auto h-12 w-12 mb-3 opacity-30" />
        <p>暂无历史评价</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {evaluations.map((ev) => (
        <div key={ev.id} className="gov-card !p-4 space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-medium text-gray-800">{ev.serviceName}</h3>
            <span className="text-xs text-gray-400">
              {new Date(ev.createdAt).toLocaleDateString('zh-CN')}
            </span>
          </div>
          <StarRating rating={ev.rating} />
          {ev.comment && (
            <p className="text-sm text-gray-600">{ev.comment}</p>
          )}
        </div>
      ))}
    </div>
  )
}

export default function Evaluation() {
  const [activeSection, setActiveSection] = useState<'pending' | 'history'>('pending')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif font-semibold text-gray-900">服务评价</h1>

      <SatisfactionSummary />

      <div className="flex gap-1 rounded-lg bg-white p-1 shadow-sm border border-gray-100 w-fit">
        <button
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeSection === 'pending'
              ? 'bg-govBlue text-white'
              : 'text-gray-500 hover:text-gray-700'
          )}
          onClick={() => setActiveSection('pending')}
        >
          待评价
        </button>
        <button
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeSection === 'history'
              ? 'bg-govBlue text-white'
              : 'text-gray-500 hover:text-gray-700'
          )}
          onClick={() => setActiveSection('history')}
        >
          历史评价
        </button>
      </div>

      {activeSection === 'pending' && <PendingEvaluations />}
      {activeSection === 'history' && <HistoricalEvaluations />}
    </div>
  )
}
