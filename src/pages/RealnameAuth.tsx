import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  Camera,
  CheckCircle2,
  XCircle,
  ChevronRight,
  CreditCard,
  Fingerprint,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

const steps = [
  { label: '证件上传', icon: CreditCard },
  { label: '人脸验证', icon: Fingerprint },
  { label: '验证结果', icon: ShieldCheck },
]

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, i) => {
        const Icon = step.icon
        const done = i < current
        const active = i === current
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                done ? 'border-govBlue bg-govBlue text-white' : active ? 'border-govBlue text-govBlue' : 'border-gray-300 text-gray-300'
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={cn('mt-1.5 text-xs', active ? 'font-medium text-govBlue' : done ? 'text-govBlue' : 'text-gray-400')}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn('mx-2 h-0.5 w-12 sm:w-20', i < current ? 'bg-govBlue' : 'bg-gray-200')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function Step1Upload({ onNext }: { onNext: () => void }) {
  const [frontUploaded, setFrontUploaded] = useState(false)
  const [backUploaded, setBackUploaded] = useState(false)

  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-gray-500">请上传身份证正反面照片</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="mb-2 text-center text-xs text-gray-500">人像面</p>
          <button
            onClick={() => setFrontUploaded(true)}
            className={cn(
              'flex h-36 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
              frontUploaded ? 'border-govGreen bg-govGreen/5' : 'border-gray-300 hover:border-govBlue/50'
            )}
          >
            {frontUploaded ? (
              <div className="text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-govGreen" />
                <span className="mt-1 block text-xs text-govGreen">已上传</span>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <span className="mt-1 block text-xs text-gray-400">点击上传</span>
              </div>
            )}
          </button>
        </div>
        <div>
          <p className="mb-2 text-center text-xs text-gray-500">国徽面</p>
          <button
            onClick={() => setBackUploaded(true)}
            className={cn(
              'flex h-36 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
              backUploaded ? 'border-govGreen bg-govGreen/5' : 'border-gray-300 hover:border-govBlue/50'
            )}
          >
            {backUploaded ? (
              <div className="text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-govGreen" />
                <span className="mt-1 block text-xs text-govGreen">已上传</span>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <span className="mt-1 block text-xs text-gray-400">点击上传</span>
              </div>
            )}
          </button>
        </div>
      </div>

      <button onClick={onNext} disabled={!frontUploaded || !backUploaded} className="gov-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50">
        下一步 <ChevronRight className="ml-1 inline h-4 w-4" />
      </button>
    </div>
  )
}

function Step2Face({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const [verified, setVerified] = useState(false)

  const handleVerify = () => {
    setVerified(true)
  }

  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-gray-500">请进行人脸识别验证</p>

      <div className="flex justify-center">
        <button
          onClick={handleVerify}
          className={cn(
            'flex h-52 w-52 flex-col items-center justify-center rounded-full border-4 transition-colors',
            verified ? 'border-govGreen bg-govGreen/5' : 'border-govBlue/30 bg-govBlue/5 hover:border-govBlue/60'
          )}
        >
          {verified ? (
            <CheckCircle2 className="h-16 w-16 text-govGreen" />
          ) : (
            <Camera className="h-16 w-16 text-govBlue/60" />
          )}
        </button>
      </div>

      {!verified && (
        <div className="rounded-lg bg-govBlue/5 px-4 py-3">
          <p className="text-center text-xs text-govBlue">请将面部正对摄像头，保持光线充足</p>
          <p className="mt-1 text-center text-xs text-gray-500">点击上方区域开始人脸识别</p>
        </div>
      )}

      {verified && (
        <p className="text-center text-sm text-govGreen">人脸识别成功</p>
      )}

      <div className="flex gap-3">
        <button onClick={onPrev} className="gov-btn-secondary flex-1">
          <ArrowLeft className="mr-1 inline h-4 w-4" /> 上一步
        </button>
        <button onClick={onNext} disabled={!verified} className="gov-btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50">
          下一步 <ChevronRight className="ml-1 inline h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function Step3Result({ success, onRetry }: { success: boolean; onRetry: () => void }) {
  const navigate = useNavigate()
  const { setRealNameVerified } = useAuthStore()

  const handleConfirm = () => {
    if (success) {
      setRealNameVerified(true)
    }
    navigate('/')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center py-8">
        {success ? (
          <>
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-govGreen/10">
              <CheckCircle2 className="h-12 w-12 text-govGreen" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-gray-800">实名认证成功</h3>
            <p className="mt-2 text-sm text-gray-500">您的身份信息已通过核验</p>
            <div className="mt-4 rounded-lg bg-govBlue/5 px-6 py-3">
              <p className="text-sm text-govBlue">认证等级：三级（已实名认证）</p>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-govRed/10">
              <XCircle className="h-12 w-12 text-govRed" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-gray-800">实名认证失败</h3>
            <p className="mt-2 text-sm text-gray-500">身份信息核验未通过，请重试</p>
          </>
        )}
      </div>

      <div className="flex gap-3">
        {!success && (
          <button onClick={onRetry} className="gov-btn-secondary flex-1">重新认证</button>
        )}
        <button onClick={handleConfirm} className={cn('flex-1', success ? 'gov-btn-primary' : 'gov-btn-primary')}>
          {success ? '返回首页' : '暂不认证'}
        </button>
      </div>
    </div>
  )
}

export default function RealnameAuth() {
  const [step, setStep] = useState(0)
  const [resultSuccess] = useState(true)

  return (
    <div className="mx-auto max-w-lg space-y-8 py-4">
      <div>
        <h2 className="font-serif text-xl font-semibold text-gray-800">实名认证</h2>
        <p className="mt-1 text-sm text-gray-500">完成实名认证即可使用全部政务服务</p>
      </div>

      <StepIndicator current={step} />

      <div className="gov-card">
        {step === 0 && <Step1Upload onNext={() => setStep(1)} />}
        {step === 1 && <Step2Face onNext={() => setStep(2)} onPrev={() => setStep(0)} />}
        {step === 2 && <Step3Result success={resultSuccess} onRetry={() => setStep(0)} />}
      </div>
    </div>
  )
}
