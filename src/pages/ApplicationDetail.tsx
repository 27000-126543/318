import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle, XCircle, Circle, AlertCircle,
  Clock, MessageSquare, Upload,
} from 'lucide-react'
import { useGovStore } from '@/stores/govStore'
import { cn } from '@/lib/utils'
import type { ApprovalNode } from '@/lib/mockData'

const statusLabels: Record<string, string> = {
  submitted: '已提交',
  first_review: '初审中',
  re_review: '复核中',
  final_review: '终审中',
  supplement: '待补充材料',
  approved: '已通过',
  rejected: '已驳回',
  timeout: '已超时',
}

const statusBadgeColors: Record<string, string> = {
  submitted: 'bg-gray-100 text-gray-600 border-gray-200',
  first_review: 'bg-govBlue/10 text-govBlue border-govBlue/20',
  re_review: 'bg-govBlue/10 text-govBlue border-govBlue/20',
  final_review: 'bg-govPurple/10 text-govPurple border-govPurple/20',
  supplement: 'bg-govOrange/10 text-govOrange border-govOrange/20',
  approved: 'bg-govGreen/10 text-govGreen border-govGreen/20',
  rejected: 'bg-govRed/10 text-govRed border-govRed/20',
  timeout: 'bg-govRed/10 text-govRed border-govRed/20',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function getProgressPercent(app: ReturnType<typeof useGovStore.getState>['applications'][0]) {
  const total = app.approvalNodes.length
  if (total === 0) return 0
  const completed = app.approvalNodes.filter(
    (n) => n.status === 'approved' || n.status === 'rejected'
  ).length
  return Math.round((completed / total) * 100)
}

function TimelineNode({ node, isLast }: { node: ApprovalNode; isLast: boolean }) {
  const isCompleted = node.status === 'approved' || node.status === 'rejected'
  const isInProgress = node.status === 'in_progress'
  const isPending = node.status === 'pending'
  const isTimeout = node.isTimeout && isInProgress

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        {isCompleted && (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-govGreen shrink-0">
            <CheckCircle className="h-4.5 w-4.5 text-white" />
          </div>
        )}
        {isInProgress && !isTimeout && (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-govBlue shrink-0 animate-pulse">
            <Circle className="h-4 w-4 text-white fill-white" />
          </div>
        )}
        {isTimeout && (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-govRed shrink-0 animate-pulse">
            <AlertCircle className="h-4.5 w-4.5 text-white" />
          </div>
        )}
        {isPending && (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 shrink-0">
            <Circle className="h-4 w-4 text-gray-400" />
          </div>
        )}
        {!isLast && (
          <div className={cn(
            'w-0.5 flex-1 min-h-[2rem]',
            isCompleted ? 'bg-govGreen' : 'bg-gray-200'
          )} />
        )}
      </div>

      <div className={cn('flex-1 pb-6', isLast && 'pb-0')}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-800">{node.nodeName}</span>
          {isCompleted && (
            <span className="text-xs text-govGreen font-medium">
              {node.status === 'approved' ? '已通过' : '已驳回'}
            </span>
          )}
          {isInProgress && !isTimeout && (
            <span className="text-xs text-govBlue font-medium">处理中</span>
          )}
          {isTimeout && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-govRed/10 text-govRed border border-govRed/20">
              超时升级
            </span>
          )}
          {isPending && (
            <span className="text-xs text-gray-400">等待中</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">办理人：{node.assignee}</p>
        {node.completedAt && (
          <p className="text-xs text-gray-400 mt-0.5">
            <Clock className="h-3 w-3 inline mr-1" />
            {formatDate(node.completedAt)}
          </p>
        )}
        {node.startedAt && !node.completedAt && (
          <p className="text-xs text-gray-400 mt-0.5">
            <Clock className="h-3 w-3 inline mr-1" />
            开始于 {formatDate(node.startedAt)}
          </p>
        )}
      </div>
    </div>
  )
}

export default function ApplicationDetail() {
  const { appId } = useParams<{ appId: string }>()
  const getApplicationById = useGovStore((s) => s.getApplicationById)
  const supplementMaterials = useGovStore((s) => s.supplementMaterials)

  const application = getApplicationById(appId!)

  if (!application) {
    return (
      <div className="gov-card text-center py-16">
        <p className="text-gray-500">未找到该办件</p>
        <Link to="/applications" className="gov-btn-secondary mt-4 inline-block">返回办件列表</Link>
      </div>
    )
  }

  const progress = getProgressPercent(application)
  const missingMaterialIds = application.materials
    .filter((m) => !m.uploaded)
    .map((m) => m.materialId)

  const handleSupplement = () => {
    supplementMaterials(application.id, missingMaterialIds)
  }

  return (
    <div>
      <Link to="/applications" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-govBlue mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        返回办件列表
      </Link>

      <div className="gov-card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h1 className="font-serif text-2xl font-bold text-gray-800">{application.serviceName}</h1>
          <span className={cn('gov-badge border', statusBadgeColors[application.status])}>
            {statusLabels[application.status]}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span>{application.department}</span>
          <span className="text-gray-300">|</span>
          <span>提交于 {formatDate(application.submittedAt)}</span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>办理进度</span>
            <span className="font-medium text-govBlue">{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-govBlue transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="gov-card mb-6">
        <h2 className="font-serif text-lg font-semibold text-gray-800 mb-5">审批流程</h2>
        <div>
          {application.approvalNodes
            .sort((a, b) => a.nodeOrder - b.nodeOrder)
            .map((node, i) => (
              <TimelineNode
                key={node.id}
                node={node}
                isLast={i === application.approvalNodes.length - 1}
              />
            ))}
        </div>
      </div>

      <div className="gov-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-semibold text-gray-800">申请材料</h2>
          {application.status === 'supplement' && missingMaterialIds.length > 0 && (
            <button onClick={handleSupplement} className="gov-btn-primary text-sm px-4 py-2 flex items-center gap-1.5">
              <Upload className="h-4 w-4" />
              补充材料
            </button>
          )}
        </div>

        <ul className="space-y-2">
          {application.materials.map((mat) => (
            <li key={mat.materialId} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              {mat.uploaded ? (
                <CheckCircle className="h-5 w-5 text-govGreen shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-govRed shrink-0" />
              )}
              <span className="text-sm text-gray-800">{mat.name}</span>
              <span className={cn(
                'ml-auto text-xs px-1.5 py-0.5 rounded',
                mat.uploaded ? 'bg-govGreen/10 text-govGreen' : 'bg-govRed/10 text-govRed'
              )}>
                {mat.uploaded ? '已上传' : '缺失'}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {application.approvalNodes.some((n) => n.comment) && (
        <div className="gov-card">
          <h2 className="font-serif text-lg font-semibold text-gray-800 mb-4">审批意见</h2>
          <div className="space-y-3">
            {application.approvalNodes
              .filter((n) => n.comment)
              .map((node) => (
                <div key={node.id} className="flex gap-3 p-3 rounded-lg bg-gray-50">
                  <MessageSquare className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-800">{node.nodeName}</span>
                      <span className="text-xs text-gray-400">{node.assignee}</span>
                    </div>
                    <p className="text-sm text-gray-600">{node.comment}</p>
                    {node.completedAt && (
                      <p className="text-xs text-gray-400 mt-1">{formatDate(node.completedAt)}</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
