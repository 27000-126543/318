import { cn } from '@/lib/utils'

type StatusType = 'approved' | 'pending' | 'rejected' | 'timeout'

interface StatusBadgeProps {
  status: StatusType
  label?: string
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  approved: {
    label: '已通过',
    className: 'bg-govGreen/10 text-govGreen border-govGreen/20',
  },
  pending: {
    label: '审核中',
    className: 'bg-govOrange/10 text-govOrange border-govOrange/20',
  },
  rejected: {
    label: '已驳回',
    className: 'bg-govRed/10 text-govRed border-govRed/20',
  },
  timeout: {
    label: '已超时',
    className: 'bg-gray-100 text-gray-500 border-gray-200',
  },
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span
      className={cn(
        'gov-badge border',
        config.className
      )}
    >
      {label || config.label}
    </span>
  )
}
