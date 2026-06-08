import { useState } from 'react'
import { FileText, Download, Lightbulb, TrendingUp, Star, AlertCircle, Calendar } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useGovStore } from '@/stores/govStore'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  { id: '1', icon: <AlertCircle className="w-5 h-5 text-govOrange" />, text: '建议9月增设3个社保窗口', tag: '社保服务' },
  { id: '2', icon: <AlertCircle className="w-5 h-5 text-govRed" />, text: '建议7月增派2名审批人员', tag: '审批管理' },
  { id: '3', icon: <Lightbulb className="w-5 h-5 text-govGreen" />, text: '建议8月开通周末预约通道', tag: '服务优化' },
  { id: '4', icon: <Lightbulb className="w-5 h-5 text-govPurple" />, text: '建议6月上线自助终端设备', tag: '设备配置' },
]

export default function Reports() {
  const { predictions, reports } = useGovStore()
  const [selectedMonth, setSelectedMonth] = useState(reports[reports.length - 1]?.month ?? '')

  const selectedReport = reports.find((r) => r.month === selectedMonth)

  const totalPredicted = predictions
    .filter((p) => !p.actual)
    .reduce((sum, p) => sum + p.predicted, 0)

  const peakMonth = predictions
    .filter((p) => !p.actual)
    .sort((a, b) => b.predicted - a.predicted)[0]

  const handleExport = (format: string) => {
    alert(`正在导出${format}格式报表...`)
  }

  return (
    <div className="min-h-screen bg-govBg p-6 space-y-8">
      <h1 className="font-serif text-2xl font-semibold text-gray-900">报表与预测</h1>

      <section className="space-y-6">
        <h2 className="font-serif text-xl font-semibold text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-govBlue" />
          业务预测
        </h2>

        <div className="gov-card">
          <h3 className="font-serif text-base font-semibold mb-4">办件量预测趋势</h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={predictions}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#1E5AA8"
                strokeWidth={2}
                name="实际值"
                dot={{ r: 4, fill: '#1E5AA8' }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="8 4"
                name="预测值"
                dot={{ r: 4, fill: '#F59E0B' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="gov-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-govBlue/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-govBlue" />
            </div>
            <div>
              <div className="text-sm text-gray-500 font-sans">下季度预测总量</div>
              <div className="text-xl font-bold text-gray-900">{totalPredicted.toLocaleString()}</div>
            </div>
          </div>

          <div className="gov-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-govOrange/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-govOrange" />
            </div>
            <div>
              <div className="text-sm text-gray-500 font-sans">预计高峰月份</div>
              <div className="text-xl font-bold text-gray-900">{peakMonth?.month ?? '-'}</div>
            </div>
          </div>

          <div className="gov-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-govGreen/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-govGreen" />
            </div>
            <div>
              <div className="text-sm text-gray-500 font-sans">高峰预测量</div>
              <div className="text-xl font-bold text-gray-900">{peakMonth?.predicted.toLocaleString() ?? '-'}</div>
            </div>
          </div>
        </div>

        <div className="gov-card">
          <h3 className="font-serif text-base font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-govOrange" />
            智能建议
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SUGGESTIONS.map((s) => (
              <div key={s.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="mt-0.5 shrink-0">{s.icon}</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{s.text}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-govBlue/10 text-govBlue text-xs rounded-full">
                    {s.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-govBlue" />
          月度报表
        </h2>

        <div className="flex items-center gap-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="gov-input w-48"
          >
            <option value="">请选择月份</option>
            {reports.map((r) => (
              <option key={r.month} value={r.month}>{r.month}</option>
            ))}
          </select>
          <button className="gov-btn-primary flex items-center gap-2" onClick={() => handleExport('PDF')}>
            <Download className="w-4 h-4" />
            导出PDF
          </button>
          <button className="gov-btn-secondary flex items-center gap-2" onClick={() => handleExport('Excel')}>
            <Download className="w-4 h-4" />
            导出Excel
          </button>
        </div>

        {selectedReport && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="gov-card text-center">
                <div className="text-sm text-gray-500 font-sans mb-1">总办件量</div>
                <div className="text-2xl font-bold text-gray-900">{selectedReport.totalApplications.toLocaleString()}</div>
              </div>
              <div className="gov-card text-center">
                <div className="text-sm text-gray-500 font-sans mb-1">平均办理时长</div>
                <div className="text-2xl font-bold text-gray-900">{selectedReport.avgProcessingTime}天</div>
              </div>
              <div className="gov-card text-center">
                <div className="text-sm text-gray-500 font-sans mb-1">满意度</div>
                <div className="flex items-center justify-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-5 h-5',
                        i < Math.floor(selectedReport.satisfaction)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                  <span className="text-lg font-bold text-gray-900 ml-1">{selectedReport.satisfaction}</span>
                </div>
              </div>
              <div className="gov-card text-center">
                <div className="text-sm text-gray-500 font-sans mb-1">超时件数</div>
                <div className="text-2xl font-bold text-govRed">{selectedReport.timeoutCount}</div>
              </div>
            </div>

            <div className="gov-card overflow-hidden">
              <h3 className="font-serif text-base font-semibold mb-4">分类明细</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-500 font-medium font-sans">业务类别</th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium font-sans">办件量</th>
                    <th className="text-right py-3 px-4 text-gray-500 font-medium font-sans">平均时长(天)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedReport.categoryBreakdown.map((item, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-800">{item.category}</td>
                      <td className="py-3 px-4 text-right text-gray-800">{item.count.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          item.avgTime > 5 ? 'bg-red-50 text-red-600' :
                          item.avgTime > 3 ? 'bg-amber-50 text-amber-600' :
                          'bg-green-50 text-green-600'
                        )}>
                          {item.avgTime}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!selectedReport && (
          <div className="gov-card text-center py-16 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>请选择月份查看报表</p>
          </div>
        )}
      </section>
    </div>
  )
}
