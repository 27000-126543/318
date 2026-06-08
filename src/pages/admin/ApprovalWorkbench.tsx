import { useState } from 'react'
import { CheckCircle, RotateCcw, XCircle, AlertTriangle, ChevronDown, ChevronUp, FileText, Clock } from 'lucide-react'
import { useGovStore } from '@/stores/govStore'
import { cn } from '@/lib/utils'
import type { Application, ApprovalNode } from '@/lib/mockData'

type QueueKey = 'first_review' | 're_review' | 'final_review' | 'supplement' | 'timeout'

const QUEUES: { key: QueueKey; label: string }[] = [
  { key: 'first_review', label: '待初审' },
  { key: 're_review', label: '待复核' },
  { key: 'final_review', label: '待终审' },
  { key: 'supplement', label: '待补充' },
  { key: 'timeout', label: '超时' },
]

const STATUS_MAP: Record<Application['status'], string> = {
  submitted: '已提交', first_review: '待初审', re_review: '待复核',
  final_review: '待终审', supplement: '待补充', approved: '已通过',
  rejected: '已驳回', timeout: '超时',
}

function currentNode(app: Application) {
  return app.approvalNodes.find((n) => n.status === 'in_progress')
}

export default function ApprovalWorkbench() {
  const { applications, approveNode, returnSupplement, rejectApplication, timeoutEscalation } = useGovStore()
  const [activeQueue, setActiveQueue] = useState<QueueKey>('first_review')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [actionMode, setActionMode] = useState<'return' | 'reject' | null>(null)

  const counts = QUEUES.reduce<Record<QueueKey, number>>((acc, q) => {
    acc[q.key] = applications.filter((a) => a.status === q.key).length
    return acc
  }, {} as Record<QueueKey, number>)

  const filtered = applications.filter((a) => a.status === activeQueue)

  function handleAction(action: () => void) {
    action()
    setExpandedId(null)
    setComment('')
    setActionMode(null)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 space-y-6">
      <h1 className="font-serif text-2xl font-semibold">审批工作台</h1>

      <div className="flex gap-2 border-b border-gray-700 pb-0">
        {QUEUES.map((q) => (
          <button
            key={q.key}
            onClick={() => { setActiveQueue(q.key); setExpandedId(null); setComment(''); setActionMode(null) }}
            className={cn(
              'relative px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeQueue === q.key
                ? 'border-govBlue text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            )}
          >
            {q.label}
            {counts[q.key] > 0 && (
              <span className={cn(
                'ml-1.5 px-1.5 py-0.5 text-xs rounded-full',
                activeQueue === q.key ? 'bg-govBlue text-white' : 'bg-gray-700 text-gray-300'
              )}>
                {counts[q.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="gov-card bg-gray-800 border-gray-700 p-12 text-center text-gray-500">
          当前队列暂无待办事项
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => {
            const node = currentNode(app)
            const isExpanded = expandedId === app.id
            return (
              <div key={app.id} className="gov-card bg-gray-800 border-gray-700 overflow-hidden">
                <button
                  onClick={() => { setExpandedId(isExpanded ? null : app.id); setComment(''); setActionMode(null) }}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-750 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-white truncate">{app.serviceName}</span>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        app.status === 'timeout' ? 'bg-red-900/50 text-red-400' : 'bg-blue-900/50 text-blue-400'
                      )}>
                        {STATUS_MAP[app.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{app.department}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{app.submittedAt.slice(0, 10)}</span>
                      {node && <span>{node.nodeName} · {node.assignee}</span>}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500 shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-700 p-5 space-y-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div><span className="text-gray-500 block mb-0.5">服务名称</span><span className="text-white">{app.serviceName}</span></div>
                      <div><span className="text-gray-500 block mb-0.5">办理部门</span><span className="text-white">{app.department}</span></div>
                      <div><span className="text-gray-500 block mb-0.5">提交时间</span><span className="text-white">{app.submittedAt.slice(0, 16).replace('T', ' ')}</span></div>
                      <div><span className="text-gray-500 block mb-0.5">当前状态</span><span className="text-white">{STATUS_MAP[app.status]}</span></div>
                    </div>

                    {node && (
                      <div className="bg-gray-900/50 rounded-lg p-4 space-y-1.5 text-sm">
                        <div className="font-medium text-white mb-2">当前审批节点</div>
                        <div className="flex items-center gap-6 text-gray-300">
                          <span>节点: <span className="text-white">{node.nodeName}</span></span>
                          <span>处理人: <span className="text-white">{node.assignee}</span></span>
                          {node.startedAt && <span>开始: <span className="text-white">{node.startedAt.slice(0, 16).replace('T', ' ')}</span></span>}
                          {node.isTimeout && <span className="text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />已超时 {node.timeoutHours}h</span>}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-sm font-medium text-white mb-2">材料清单</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {app.materials.map((m) => (
                          <div key={m.materialId} className={cn(
                            'flex items-center gap-2 text-sm px-3 py-2 rounded-lg',
                            m.uploaded ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'
                          )}>
                            <FileText className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{m.name}</span>
                            <span className="text-xs ml-auto">{m.uploaded ? '已传' : '缺失'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {(actionMode === 'return' || actionMode === 'reject') && (
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={actionMode === 'return' ? '请输入退回补充原因…' : '请输入驳回原因…'}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-600 resize-none h-20 focus:outline-none focus:border-govBlue"
                      />
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleAction(() => approveNode(app.id))}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />通过
                      </button>
                      <button
                        onClick={() => {
                          if (actionMode === 'return' && comment.trim()) {
                            handleAction(() => returnSupplement(app.id, comment.trim()))
                          } else {
                            setActionMode(actionMode === 'return' ? null : 'return')
                            setComment('')
                          }
                        }}
                        className={cn(
                          'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                          actionMode === 'return' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-amber-600/20 text-amber-400 hover:bg-amber-600/30'
                        )}
                      >
                        <RotateCcw className="w-4 h-4" />退回补充
                      </button>
                      <button
                        onClick={() => {
                          if (actionMode === 'reject' && comment.trim()) {
                            handleAction(() => rejectApplication(app.id, comment.trim()))
                          } else {
                            setActionMode(actionMode === 'reject' ? null : 'reject')
                            setComment('')
                          }
                        }}
                        className={cn(
                          'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                          actionMode === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                        )}
                      >
                        <XCircle className="w-4 h-4" />驳回
                      </button>
                      {activeQueue === 'timeout' && (
                        <button
                          onClick={() => handleAction(() => timeoutEscalation(app.id))}
                          className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm font-medium transition-colors ml-auto"
                        >
                          <AlertTriangle className="w-4 h-4" />超时升级
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
