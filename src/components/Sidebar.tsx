import { NavLink, useLocation } from 'react-router-dom'
import {
  Home,
  FileText,
  CreditCard,
  Calendar,
  Award,
  Star,
  ShieldCheck,
  LayoutDashboard,
  ClipboardCheck,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/appStore'

interface NavItem {
  label: string
  path: string
  icon: typeof Home
}

const navItems: NavItem[] = [
  { label: '首页', path: '/', icon: Home },
  { label: '事项办理', path: '/services', icon: FileText },
  { label: '我的办件', path: '/applications', icon: CreditCard },
  { label: '证件中心', path: '/certificates', icon: Award },
  { label: '预约办事', path: '/appointment', icon: Calendar },
  { label: '电子证照', path: '/e-licenses', icon: CreditCard },
  { label: '评价中心', path: '/evaluation', icon: Star },
  { label: '管理看板', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: '审批工作台', path: '/admin/approval', icon: ClipboardCheck },
]

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore()
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-30 hidden h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 lg:flex',
        sidebarCollapsed ? 'w-[72px]' : 'w-[240px]'
      )}
    >
      <div className="flex h-[60px] items-center border-b border-gray-100 px-4">
        {!sidebarCollapsed && (
          <h1 className="font-serif text-lg font-bold text-govBlue">
            智慧政务
          </h1>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600',
            sidebarCollapsed ? 'mx-auto' : 'ml-auto'
          )}
        >
          <ChevronLeft
            className={cn(
              'h-5 w-5 transition-transform',
              sidebarCollapsed && 'rotate-180'
            )}
          />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-govBlue/10 text-govBlue'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0',
                      active ? 'text-govBlue' : 'text-gray-400'
                    )}
                  />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-100 px-3 py-3">
        <NavLink
          to="/auth/realname"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <ShieldCheck className="h-5 w-5 shrink-0 text-gray-400" />
          {!sidebarCollapsed && <span>实名认证</span>}
        </NavLink>
      </div>
    </aside>
  )
}
