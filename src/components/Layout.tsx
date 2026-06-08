import { Outlet } from 'react-router-dom'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Home,
  FileText,
  CreditCard,
  Calendar,
  Award,
  Star,
  LayoutDashboard,
  Bell,
  Menu,
  User,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import Sidebar from '@/components/Sidebar'

const mobileNavItems = [
  { label: '首页', path: '/', icon: Home },
  { label: '事项办理', path: '/services', icon: FileText },
  { label: '我的办件', path: '/applications', icon: CreditCard },
  { label: '预约办事', path: '/appointment', icon: Calendar },
  { label: '电子证照', path: '/e-licenses', icon: Award },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const { sidebarCollapsed, unreadCount } = useAppStore()
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-govBg">
      <Sidebar />

      <div
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[240px]'
        )}
      >
        <header className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
              <Bell className="h-5 w-5" />
              {unreadCount() > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-govRed px-1 text-[10px] font-bold text-white">
                  {unreadCount() > 99 ? '99+' : unreadCount()}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-govBlue/10">
                  <User className="h-4 w-4 text-govBlue" />
                </div>
                <span className="hidden text-sm font-medium text-gray-700 lg:block">
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="gov-btn-primary text-sm !px-4 !py-1.5"
              >
                登录
              </NavLink>
            )}
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white lg:hidden">
        <ul className="flex items-center justify-around py-2">
          {mobileNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]',
                    active ? 'text-govBlue' : 'text-gray-400'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
