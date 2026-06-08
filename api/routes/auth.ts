import { Router, type Request, type Response } from 'express'

const router = Router()

const users: Record<string, { phone: string; password: string; name: string; realNameVerified: boolean }> = {
  '13888888888': { phone: '13888888888', password: '123456', name: '张三', realNameVerified: true },
}

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { phone, password, name } = req.body
  if (!phone || !password || !name) {
    res.status(400).json({ success: false, error: '请填写完整信息' })
    return
  }
  if (users[phone]) {
    res.status(400).json({ success: false, error: '该手机号已注册' })
    return
  }
  users[phone] = { phone, password, name, realNameVerified: false }
  res.json({ success: true, data: { token: 'mock-token-' + Date.now(), user: { id: Date.now().toString(), name, phone, realNameVerified: false, authLevel: 0, role: 'citizen' } } })
})

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { phone, password } = req.body
  const user = users[phone]
  if (!user || user.password !== password) {
    res.status(401).json({ success: false, error: '手机号或密码错误' })
    return
  }
  res.json({ success: true, data: { token: 'mock-token-' + Date.now(), user: { id: '1', name: user.name, phone, realNameVerified: user.realNameVerified, authLevel: user.realNameVerified ? 3 : 0, role: 'citizen' } } })
})

router.post('/verify-realname', async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: { verified: true, level: 3, idCardInfo: { name: '张三', idNumber: '320106199001011234' } } })
})

export default router
