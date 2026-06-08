import { useState } from 'react'
import {
  CreditCard,
  HeartPulse,
  Car,
  Globe,
  Home,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGovStore } from '@/stores/govStore'
import { certificateTypeLabels } from '@/lib/mockData'
import type { Certificate } from '@/lib/mockData'

const typeIcons: Record<Certificate['type'], typeof CreditCard> = {
  idcard: CreditCard,
  social_security: HeartPulse,
  driver_license: Car,
  passport: Globe,
  residence: Home,
}

const statusConfig: Record<Certificate['status'], { label: string; color: string; icon: typeof CheckCircle2 }> = {
  valid: { label: '有效', color: 'bg-govGreen/10 text-govGreen', icon: CheckCircle2 },
  expired: { label: '已过期', color: 'bg-govRed/10 text-govRed', icon: XCircle },
  pending_update: { label: '待更新', color: 'bg-govOrange/10 text-govOrange', icon: Clock },
}

function maskNumber(number: string) {
  if (number.length <= 8) return number.slice(0, 3) + '****' + number.slice(-1)
  return number.slice(0, 4) + '****' + number.slice(-4)
}

function AddCertModal({ onClose }: { onClose: () => void }) {
  const { addCertificate } = useGovStore()
  const [type, setType] = useState<Certificate['type']>('idcard')
  const [number, setNumber] = useState('')
  const [holderName, setHolderName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!type || !number || !holderName) return

    const now = new Date().toISOString().split('T')[0]
    const expireDate = new Date(Date.now() + 365 * 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    addCertificate({
      userId: '1',
      type,
      number,
      holderName,
      issueDate: now,
      expireDate,
      status: 'valid',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold">添加证照</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">证照类型</label>
            <select value={type} onChange={(e) => setType(e.target.value as Certificate['type'])} className="gov-input">
              {(Object.entries(certificateTypeLabels) as [Certificate['type'], string][]).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">证照号码</label>
            <input type="text" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="请输入证照号码" className="gov-input" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">持有人姓名</label>
            <input type="text" value={holderName} onChange={(e) => setHolderName(e.target.value)} placeholder="请输入持有人姓名" className="gov-input" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="gov-btn-secondary flex-1">取消</button>
            <button type="submit" disabled={!type || !number || !holderName} className="gov-btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50">添加</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ cert, onClose }: { cert: Certificate; onClose: () => void }) {
  const { removeCertificate } = useGovStore()

  const handleDelete = () => {
    removeCertificate(cert.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex flex-col items-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-govRed/10">
            <AlertTriangle className="h-7 w-7 text-govRed" />
          </div>
          <h3 className="font-serif text-lg font-semibold">确认删除</h3>
          <p className="mt-2 text-center text-sm text-gray-500">
            确定要删除 <span className="font-medium text-gray-700">{certificateTypeLabels[cert.type]}</span> 吗？此操作不可恢复。
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="gov-btn-secondary flex-1">取消</button>
          <button onClick={handleDelete} className="flex-1 rounded-lg bg-govRed px-6 py-2.5 font-medium text-white transition-colors hover:bg-govRed/90">删除</button>
        </div>
      </div>
    </div>
  )
}

export default function Certificates() {
  const { certificates } = useGovStore()
  const [showAdd, setShowAdd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Certificate | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-semibold text-gray-800">我的证照</h2>
          <p className="mt-1 text-sm text-gray-500">管理您的各类证照信息</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="gov-btn-primary flex items-center gap-1.5 !px-4 text-sm">
          <Plus className="h-4 w-4" /> 添加证照
        </button>
      </div>

      {certificates.length === 0 ? (
        <div className="gov-card flex flex-col items-center py-16 text-gray-400">
          <Shield className="mb-3 h-12 w-12" />
          <p className="text-sm">暂无证照信息</p>
          <button onClick={() => setShowAdd(true)} className="gov-btn-primary mt-4 text-sm">添加第一张证照</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {certificates.map((cert) => {
            const Icon = typeIcons[cert.type]
            const status = statusConfig[cert.status]
            const StatusIcon = status.icon
            return (
              <div key={cert.id} className="gov-card group relative">
                <button
                  onClick={() => setDeleteTarget(cert)}
                  className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-gray-300 opacity-0 transition-all hover:bg-govRed/10 hover:text-govRed group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-govBlue/10">
                    <Icon className="h-5 w-5 text-govBlue" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h4 className="text-sm font-medium text-gray-800">{certificateTypeLabels[cert.type]}</h4>
                      <span className={cn('gov-badge text-[10px]', status.color)}>
                        <StatusIcon className="mr-0.5 h-3 w-3" />
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">编号：{maskNumber(cert.number)}</p>
                    <p className="mt-1 text-xs text-gray-400">有效期至 {cert.expireDate}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showAdd && <AddCertModal onClose={() => setShowAdd(false)} />}
      {deleteTarget && <DeleteConfirmModal cert={deleteTarget} onClose={() => setDeleteTarget(null)} />}
    </div>
  )
}
