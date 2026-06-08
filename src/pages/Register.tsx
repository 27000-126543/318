import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Phone, Lock, Eye, EyeOff, User, Shield, CheckSquare, Square } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuthStore()

  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [codeCountdown, setCodeCountdown] = useState(0)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendCode = () => {
    if (codeCountdown > 0 || !phone) return
    setCodeCountdown(60)
    const timer = setInterval(() => {
      setCodeCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!phone || !code || !password || !confirmPassword || !name) {
      setError('请填写所有必填项')
      return
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }
    if (password.length < 6) {
      setError('密码长度不能少于6位')
      return
    }
    if (!agreed) {
      setError('请阅读并同意用户协议')
      return
    }

    setLoading(true)
    try {
      await register(phone, password, name)
      navigate('/auth/realname')
    } catch {
      setError('注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 items-center justify-center bg-gradient-to-br from-govBlue via-govBlue/90 to-govBlue/70 lg:flex">
        <div className="relative px-12 text-white">
          <div className="absolute -top-32 -left-20 h-72 w-72 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-white/5" />
          <div className="relative z-10">
            <div className="mb-6 flex items-center gap-3">
              <Shield className="h-10 w-10" />
              <h1 className="font-serif text-3xl font-bold">智慧政务</h1>
            </div>
            <p className="mb-8 text-lg text-white/80">一站式政务服务大厅</p>
            <div className="relative mx-auto h-40 w-64 overflow-hidden rounded-lg bg-white/10">
              <div className="absolute inset-x-0 bottom-0 h-24 rounded-t-[40%] bg-white/15" />
              <div className="absolute bottom-6 left-1/2 h-20 w-12 -translate-x-1/2 bg-white/20">
                <div className="mx-auto h-3 w-8 bg-white/25" />
                <div className="mx-auto mt-1 h-1 w-6 bg-white/15" />
                <div className="mx-auto mt-1 h-1 w-6 bg-white/15" />
              </div>
              <div className="absolute bottom-6 left-6 h-8 w-6 bg-white/15" />
              <div className="absolute bottom-6 right-6 h-8 w-6 bg-white/15" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <div className="mb-3 flex items-center justify-center gap-2">
              <Shield className="h-8 w-8 text-govBlue" />
              <h1 className="font-serif text-2xl font-bold text-govBlue">智慧政务</h1>
            </div>
          </div>

          <h2 className="mb-2 font-serif text-2xl font-semibold text-gray-800">注册账号</h2>
          <p className="mb-8 text-sm text-gray-500">创建您的政务服务账号</p>

          {error && (
            <div className="mb-4 rounded-lg bg-govRed/10 px-4 py-2.5 text-sm text-govRed">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">手机号</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="请输入手机号" className="gov-input pl-10" maxLength={11} />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">验证码</label>
              <div className="flex gap-3">
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="请输入验证码" className="gov-input flex-1" />
                <button type="button" onClick={handleSendCode} disabled={codeCountdown > 0 || !phone} className="gov-btn-secondary shrink-0 !px-4 text-sm disabled:cursor-not-allowed disabled:opacity-50">
                  {codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码'}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="请输入密码（不少于6位）" className="gov-input pl-10 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">确认密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="请再次输入密码" className="gov-input pl-10" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">姓名</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入真实姓名" className="gov-input pl-10" />
              </div>
            </div>

            <button type="button" onClick={() => setAgreed(!agreed)} className="flex items-center gap-2 text-sm text-gray-600">
              {agreed ? <CheckSquare className="h-4 w-4 text-govBlue" /> : <Square className="h-4 w-4 text-gray-400" />}
              <span>我已阅读并同意《智慧政务用户服务协议》和《隐私政策》</span>
            </button>

            <button type="submit" disabled={loading} className="gov-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            已有账号？
            <Link to="/login" className="ml-1 font-medium text-govBlue hover:underline">立即登录</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
