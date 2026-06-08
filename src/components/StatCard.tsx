import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: LucideIcon
  value: string | number
  label: string
  trend?: number
  className?: string
  iconClassName?: string
}

export default function StatCard({
  icon: Icon,
  value,
  label,
  trend,
  className,
  iconClassName,
}: StatCardProps) {
  return (
    <div className={cn('gov-card flex items-center gap-4', className)}>
      <div
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-govBlue/10',
          iconClassName
        )}
      >
        <Icon className="h-6 w-6 text-govBlue" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      {trend !== undefined && (
        <div
          className={cn(
            'flex items-center gap-0.5 text-sm font-medium',
            trend >= 0 ? 'text-govGreen' : 'text-govRed'
          )}
        >
          {trend >= 0 ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
  )
}
