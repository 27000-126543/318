import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Clock, Flame, Globe, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { useGovStore } from '@/stores/govStore'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const getServiceById = useGovStore((s) => s.getServiceById)
  const checkMaterials = useGovStore((s) => s.checkMaterials)
  const submitApplication = useGovStore((s) => s.submitApplication)
  const user = useAuthStore((s) => s.user)

  const service = getServiceById(id!)
  const materialChecks = checkMaterials(id!)

  const [purpose, setPurpose] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!service) {
    return (
      <div className="gov-card text-center py-16">
        <p className="text-gray-500">未找到该服务</p>
        <Link to="/services" className="gov-btn-secondary mt-4 inline-block">返回服务列表</Link>
      </div>
    )
  }

  const readyCount = materialChecks.filter((m) => m.hasCert).length
  const missingCount = materialChecks.filter((m) => !m.hasCert).length

  const handleSubmit = () => {
    if (!user?.realNameVerified) return
    setSubmitting(true)
    const appId = submitApplication(service.id, { purpose })
    if (appId) {
      navigate(`/applications/${appId}`)
    } else {
      navigate('/applications')
    }
  }

  return (
    <div>
      <Link to="/services" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-govBlue mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        返回服务列表
      </Link>

      <div className="gov-card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-gray-800">{service.name}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
              <span>{service.category}</span>
              <span className="text-gray-300">|</span>
              <span>{service.department}</span>
            </div>
          </div>
          {service.onlineOnly && (
            <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-govGreen/10 text-govGreen border border-govGreen/20">
              <Globe className="h-3 w-3" />
              全程网办
            </span>
          )}
        </div>

        <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
          <span className="flex items-center gap-1.5 text-sm text-gray-600">
            <Clock className="h-4 w-4 text-gray-400" />
            平均办理 <span className="font-medium text-gray-800">{service.avgProcessingDays}</span> 个工作日
          </span>
          <span className="flex items-center gap-1.5 text-sm text-govOrange">
            <Flame className="h-4 w-4" />
            热度 <span className="font-medium">{service.heat}</span>
          </span>
        </div>
      </div>

      <div className="gov-card mb-6">
        <h2 className="font-serif text-lg font-semibold text-gray-800 mb-3">服务说明</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{service.description}</p>
      </div>

      <div className="gov-card mb-6">
        <h2 className="font-serif text-lg font-semibold text-gray-800 mb-4">所需材料</h2>

        <div className="flex items-center gap-4 mb-4 px-4 py-2.5 rounded-lg bg-gray-50 text-sm">
          <span className="text-govGreen font-medium">{readyCount}项已备</span>
          <span className="text-gray-300">/</span>
          <span className="text-govRed font-medium">{missingCount}项缺失</span>
        </div>

        <ul className="space-y-3">
          {materialChecks.map(({ material, hasCert }) => (
            <li key={material.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              {hasCert ? (
                <CheckCircle className="h-5 w-5 text-govGreen shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-govRed shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">{material.name}</span>
                  {material.required && (
                    <span className="text-xs text-govRed">*必填</span>
                  )}
                  <span className={cn(
                    'ml-auto text-xs px-1.5 py-0.5 rounded',
                    hasCert ? 'bg-govGreen/10 text-govGreen' : 'bg-govRed/10 text-govRed'
                  )}>
                    {hasCert ? '已备' : '缺失'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{material.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="gov-card">
        <h2 className="font-serif text-lg font-semibold text-gray-800 mb-4">在线申请</h2>

        {!user?.realNameVerified && (
          <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-lg bg-govOrange/10 border border-govOrange/20">
            <AlertTriangle className="h-5 w-5 text-govOrange shrink-0" />
            <p className="text-sm text-govOrange">
              请先完成实名认证后再提交申请。
              <Link to="/auth/realname" className="underline ml-1 font-medium">前往认证</Link>
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">申请事由</label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="请简要说明办理该事项的原因..."
              rows={4}
              className="gov-input resize-none"
              disabled={!user?.realNameVerified}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!user?.realNameVerified || submitting || !purpose.trim()}
            className={cn(
              'gov-btn-primary w-full',
              (!user?.realNameVerified || submitting || !purpose.trim()) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {submitting ? '提交中...' : '提交申请'}
          </button>
        </div>
      </div>
    </div>
  )
}
