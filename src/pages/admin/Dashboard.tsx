import { useState } from 'react'
import { TrendingUp, TrendingDown, Clock, AlertTriangle, Users, Building2 } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useGovStore } from '@/stores/govStore'
import { cn } from '@/lib/utils'

const COLORS = ['#1E5AA8', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

const REGIONS = ['全部', '中心城区', '东区', '西区', '南区', '北区']
const DEPARTMENTS = ['全部部门', '人力资源和社会保障局', '住房公积金管理中心', '税务局', '公安局', '医疗保障局', '市场监督管理局']

export default function Dashboard() {
  const { dashboard, halls } = useGovStore()
  const [region, setRegion] = useState('全部')
  const [department, setDepartment] = useState('全部部门')
  const [dateRange, setDateRange] = useState('')

  const stats = [
    {
      label: '全市办件量',
      value: dashboard.totalApplications.toLocaleString(),
      icon: <TrendingUp className="w-5 h-5" />,
      trend: <TrendingUp className="w-4 h-4 text-emerald-400" />,
      trendLabel: '+12.5%',
      color: 'from-blue-600 to-blue-800',
    },
    {
      label: '平均办理时长',
      value: `${dashboard.avgProcessingTime}天`,
      icon: <Clock className="w-5 h-5" />,
      trend: <TrendingDown className="w-4 h-4 text-emerald-400" />,
      trendLabel: '-0.3天',
      color: 'from-amber-600 to-amber-800',
    },
    {
      label: '窗口繁忙度',
      value: `${dashboard.windowBusyness}%`,
      icon: <Users className="w-5 h-5" />,
      progress: dashboard.windowBusyness,
      color: 'from-emerald-600 to-emerald-800',
    },
    {
      label: '投诉处理时效',
      value: `${dashboard.complaintResolutionTime}天`,
      icon: <AlertTriangle className="w-5 h-5" />,
      trend: <TrendingDown className="w-4 h-4 text-emerald-400" />,
      trendLabel: '-0.5天',
      color: 'from-purple-600 to-purple-800',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 space-y-6">
      <h1 className="font-serif text-2xl font-semibold">政务数据看板</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={cn('gov-card bg-gradient-to-br rounded-xl p-5 border-0', s.color)}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/80 text-sm font-sans">{s.label}</span>
              <div className="text-white/60">{s.icon}</div>
            </div>
            <div className="text-2xl font-bold mb-1">{s.value}</div>
            {s.progress !== undefined ? (
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div
                  className="bg-white/80 h-2 rounded-full transition-all"
                  style={{ width: `${s.progress}%` }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-white/70">
                {s.trend}
                <span>{s.trendLabel}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="gov-card bg-gray-800 border-gray-700 p-4 flex flex-wrap items-center gap-4">
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="gov-input bg-gray-700 border-gray-600 text-white text-sm w-36"
        >
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="gov-input bg-gray-700 border-gray-600 text-white text-sm w-48"
        >
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <input
          type="date"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="gov-input bg-gray-700 border-gray-600 text-white text-sm w-44"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="gov-card bg-gray-800 border-gray-700 p-5">
          <h3 className="font-serif text-lg font-semibold mb-4">办件量趋势</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={dashboard.applicationTrend}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E5AA8" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#1E5AA8" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: 8 }} />
              <Area type="monotone" dataKey="count" stroke="#1E5AA8" fill="url(#blueGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="gov-card bg-gray-800 border-gray-700 p-5">
          <h3 className="font-serif text-lg font-semibold mb-4">业务类型分布</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={dashboard.categoryDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: '#9CA3AF' }}
              >
                {dashboard.categoryDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: 8 }} />
              <Legend wrapperStyle={{ color: '#D1D5DB', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="gov-card bg-gray-800 border-gray-700 p-5">
          <h3 className="font-serif text-lg font-semibold mb-4">区域对比</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dashboard.regionComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="region" stroke="#9CA3AF" fontSize={12} />
              <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: 8 }} />
              <Legend wrapperStyle={{ color: '#D1D5DB', fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="count" fill="#1E5AA8" name="办件量" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="avgTime" fill="#F59E0B" name="平均时长(天)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="gov-card bg-gray-800 border-gray-700 p-5">
          <h3 className="font-serif text-lg font-semibold mb-4">部门效能排名</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dashboard.departmentStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" domain={[0, 5]} stroke="#9CA3AF" fontSize={12} />
              <YAxis type="category" dataKey="department" width={140} stroke="#9CA3AF" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: 8 }} />
              <Bar dataKey="satisfaction" fill="#10B981" name="满意度评分" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="font-serif text-lg font-semibold mb-4">各大厅窗口繁忙度</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {halls.map((hall) => {
            const busyness = Math.round((hall.currentServing / hall.todayQueue) * 100)
            return (
              <div key={hall.id} className="gov-card bg-gray-800 border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-govBlue" />
                  <span className="font-medium text-sm truncate">{hall.name}</span>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span>排队人数</span>
                    <span className="text-white font-medium">{hall.todayQueue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>办理中</span>
                    <span className="text-white font-medium">{hall.currentServing}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>繁忙度</span>
                    <span className={cn('font-medium', busyness > 70 ? 'text-red-400' : busyness > 50 ? 'text-amber-400' : 'text-emerald-400')}>
                      {busyness}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all',
                        busyness > 70 ? 'bg-red-500' : busyness > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      )}
                      style={{ width: `${busyness}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
