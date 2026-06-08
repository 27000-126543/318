import { ScanLine, Users, Clock, MapPin, Building2, ArrowRight } from 'lucide-react'
import { useGovStore } from '@/stores/govStore'
import { cn } from '@/lib/utils'

export default function Queue() {
  const { appointments, halls, checkIn } = useGovStore()

  const checkedInApt = appointments.find((a) => a.status === 'checked_in')
  const bookedApts = appointments.filter((a) => a.status === 'booked')

  const hall = checkedInApt
    ? halls.find((h) => h.id === checkedInApt.hallId)
    : null

  const queueNumber = checkedInApt?.queueNumber ?? 0
  const currentServing = hall?.currentServing ?? 0
  const waitingCount = checkedInApt ? (hall ? hall.todayQueue - hall.currentServing : 0) : 0
  const estimatedWait = waitingCount * 5

  const handleCheckIn = (appointmentId: string) => {
    checkIn(appointmentId)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif font-semibold text-gray-900">排队叫号</h1>

      {checkedInApt ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="gov-card flex flex-col items-center py-8">
            <div className="mb-2 text-sm text-gray-500">您的排队号码</div>
            <div className="text-7xl font-bold font-serif text-govBlue mb-4">
              {queueNumber}
            </div>
            <div className="flex items-center gap-2 text-lg text-gray-600">
              <span>当前叫号</span>
              <span className="text-3xl font-bold font-serif text-govOrange">
                {currentServing}
              </span>
            </div>
            <div className="mt-1 text-sm text-gray-400">
              前方还有 {Math.max(queueNumber - currentServing, 0)} 人等候
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-sm">
              <div className="rounded-xl bg-govBlue/5 p-4 text-center">
                <Users className="mx-auto h-5 w-5 text-govBlue mb-1" />
                <div className="text-2xl font-bold text-gray-800">{waitingCount}</div>
                <div className="text-xs text-gray-500">等候人数</div>
              </div>
              <div className="rounded-xl bg-govOrange/5 p-4 text-center">
                <Clock className="mx-auto h-5 w-5 text-govOrange mb-1" />
                <div className="text-2xl font-bold text-gray-800">~{estimatedWait}</div>
                <div className="text-xs text-gray-500">预计等候(分钟)</div>
              </div>
            </div>

            {hall && (
              <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4" />
                {hall.name} · {hall.address}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="gov-card">
              <h2 className="text-lg font-serif font-semibold text-gray-800 mb-4">实时排队信息</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg bg-govBlue/5 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-govBlue text-white font-bold">
                    {currentServing}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">正在办理</div>
                    <div className="text-xs text-gray-500">3号窗口</div>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-govBlue" />
                </div>
                {[currentServing + 1, currentServing + 2, currentServing + 3].map((num) => (
                  <div key={num} className="flex items-center gap-3 rounded-lg border border-gray-100 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 font-bold">
                      {num}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600">等候中</div>
                      <div className="text-xs text-gray-400">预计等候 {(num - currentServing) * 5} 分钟</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {hall && (
              <div className="gov-card">
                <h2 className="text-lg font-serif font-semibold text-gray-800 mb-3">大厅信息</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="h-4 w-4 text-govBlue" />
                    {hall.name}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 text-govBlue" />
                    {hall.address}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4 text-govBlue" />
                    办事窗口 {hall.windowCount} 个
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4 text-govBlue" />
                    今日取号 {hall.todayQueue} 人 · 已办理 {hall.currentServing} 人
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="gov-card flex flex-col items-center py-16">
            <ScanLine className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-lg font-serif font-semibold text-gray-600 mb-2">
              请先签到取号
            </h2>
            <p className="text-sm text-gray-400 text-center max-w-xs">
              如您已预约办事，请点击下方按钮签到取号，获取排队号码
            </p>
          </div>

          <div className="gov-card">
            <h2 className="text-lg font-serif font-semibold text-gray-800 mb-4">待签到预约</h2>
            {bookedApts.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Users className="mx-auto h-12 w-12 mb-3 opacity-30" />
                <p>暂无待签到预约</p>
                <p className="text-sm mt-1">请先预约办事后再签到取号</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookedApts.map((apt) => (
                  <div
                    key={apt.id}
                    className="rounded-lg border border-gray-100 bg-gray-50/50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800">{apt.serviceType}</h3>
                        <p className="mt-1 text-sm text-gray-500">{apt.hallName}</p>
                        <p className="text-sm text-gray-400">
                          {apt.appointmentDate} {apt.timeSlot}
                        </p>
                      </div>
                      <button
                        className="gov-btn-primary flex items-center gap-1.5 !px-4 !py-2 text-sm"
                        onClick={() => handleCheckIn(apt.id)}
                      >
                        <ScanLine className="h-4 w-4" />
                        签到取号
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
