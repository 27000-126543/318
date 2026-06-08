import { useState } from 'react'
import { QrCode, RefreshCw, Share2, FileText, Shield } from 'lucide-react'
import { useGovStore } from '@/stores/govStore'
import { cn } from '@/lib/utils'
import type { ELicense } from '@/lib/mockData'

const licenseTypes = ['身份证', '社保卡', '驾驶证', '护照', '居住证', '营业执照']

type TabKey = 'my' | 'apply' | 'share'

const statusConfig: Record<ELicense['status'], { label: string; className: string }> = {
  active: { label: '有效', className: 'bg-govGreen/10 text-govGreen border-govGreen/20' },
  expired: { label: '已过期', className: 'bg-govRed/10 text-govRed border-govRed/20' },
  pending: { label: '申领中', className: 'bg-govOrange/10 text-govOrange border-govOrange/20' },
  renewing: { label: '续期中', className: 'bg-govPurple/10 text-govPurple border-govPurple/20' },
}

function MyLicenses() {
  const { eLicenses, renewELicense } = useGovStore()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {eLicenses.map((license) => {
        const sc = statusConfig[license.status]
        return (
          <div key={license.id} className="gov-card !p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">{license.type}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{license.licenseNumber}</p>
              </div>
              <span className={cn('gov-badge border', sc.className)}>{sc.label}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>有效期至 {license.expireDate}</span>
              <QrCode className="h-5 w-5 text-govBlue cursor-pointer hover:text-govBlue/70" />
            </div>
            {license.status === 'expired' && (
              <button
                className="gov-btn-secondary flex items-center gap-1.5 !px-3 !py-1.5 text-sm w-full justify-center"
                onClick={() => renewELicense(license.id)}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                续期
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ApplyLicense() {
  const { applyELicense } = useGovStore()
  const [selectedType, setSelectedType] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!selectedType) return
    applyELicense(selectedType)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setSelectedType('')
    }, 2000)
  }

  return (
    <div className="gov-card max-w-md mx-auto space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <FileText className="h-6 w-6 text-govBlue" />
        <h3 className="font-serif font-semibold text-gray-800 text-lg">申领电子证照</h3>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1.5">证照类型</label>
        <select
          className="gov-input"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">请选择证照类型</option>
          {licenseTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <button
        className={cn(
          'gov-btn-primary w-full',
          !selectedType && 'opacity-50 cursor-not-allowed'
        )}
        disabled={!selectedType}
        onClick={handleSubmit}
      >
        {submitted ? '申领已提交' : '提交申领'}
      </button>
    </div>
  )
}

function ShareLicense() {
  const { eLicenses, shareELicense } = useGovStore()
  const activeLicenses = eLicenses.filter((l) => l.status === 'active')

  const [selectedLicense, setSelectedLicense] = useState('')
  const [targetOrg, setTargetOrg] = useState('')
  const [expireDate, setExpireDate] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const allShares = eLicenses.flatMap((l) =>
    l.shares.map((s) => ({ ...s, licenseType: l.type }))
  )

  const handleSubmit = () => {
    if (!selectedLicense || !targetOrg || !expireDate) return
    shareELicense(selectedLicense, targetOrg, expireDate)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setSelectedLicense('')
      setTargetOrg('')
      setExpireDate('')
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="gov-card max-w-md space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <Share2 className="h-6 w-6 text-govBlue" />
          <h3 className="font-serif font-semibold text-gray-800 text-lg">授权共享</h3>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">选择证照</label>
          <select
            className="gov-input"
            value={selectedLicense}
            onChange={(e) => setSelectedLicense(e.target.value)}
          >
            <option value="">请选择证照</option>
            {activeLicenses.map((l) => (
              <option key={l.id} value={l.id}>{l.type} - {l.licenseNumber}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">目标机构</label>
          <input
            className="gov-input"
            placeholder="请输入目标机构名称"
            value={targetOrg}
            onChange={(e) => setTargetOrg(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">授权到期日期</label>
          <input
            type="date"
            className="gov-input"
            value={expireDate}
            onChange={(e) => setExpireDate(e.target.value)}
          />
        </div>
        <button
          className={cn(
            'gov-btn-primary w-full',
            (!selectedLicense || !targetOrg || !expireDate) && 'opacity-50 cursor-not-allowed'
          )}
          disabled={!selectedLicense || !targetOrg || !expireDate}
          onClick={handleSubmit}
        >
          {submitted ? '授权已提交' : '提交授权'}
        </button>
      </div>

      {allShares.length > 0 && (
        <div className="gov-card">
          <h3 className="font-serif font-semibold text-gray-800 mb-3">共享记录</h3>
          <div className="space-y-3">
            {allShares.map((share) => (
              <div
                key={share.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
              >
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {share.licenseType} → {share.targetOrg}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    授权至 {share.expireDate}
                  </div>
                </div>
                <span
                  className={cn(
                    'gov-badge',
                    share.status === 'active'
                      ? 'bg-govGreen/10 text-govGreen'
                      : 'bg-gray-100 text-gray-400'
                  )}
                >
                  {share.status === 'active' ? '生效中' : '已过期'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ELicenses() {
  const [activeTab, setActiveTab] = useState<TabKey>('my')

  const tabs: { key: TabKey; label: string; icon: typeof FileText }[] = [
    { key: 'my', label: '我的证照', icon: FileText },
    { key: 'apply', label: '申领证照', icon: Shield },
    { key: 'share', label: '授权共享', icon: Share2 },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif font-semibold text-gray-900">电子证照</h1>

      <div className="flex gap-1 rounded-lg bg-white p-1 shadow-sm border border-gray-100 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-govBlue text-white'
                : 'text-gray-500 hover:text-gray-700'
            )}
            onClick={() => setActiveTab(tab.key)}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'my' && <MyLicenses />}
      {activeTab === 'apply' && <ApplyLicense />}
      {activeTab === 'share' && <ShareLicense />}
    </div>
  )
}
