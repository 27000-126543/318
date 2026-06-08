import { useState } from 'react'
import { Calendar, Clock, MapPin, Users, X, CheckCircle2 } from 'lucide-react'
import { useGovStore } from '@/stores/govStore'
import { cn } from '@/lib/utils'
import type { TimeSlot } from '@/lib/mockData'

const serviceCategories = [
  '社保服务', '住房服务', '税务服务', '户政服务',
  '交通服务', '医疗服务', '民政服务', '商事服务',
]

function getNext7Days() {
  const days: { label: string; value: string }[] = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
    days.push({
      label: i === 0 ? '今天' : i === 1 ? '明天' : `${d.getMonth() + 1}/${d.getDate()} ${weekday}`,
      value: d.toISOString().split('T')[0],
    })
  }
  return days
}

function CrowdingBadge({ crowding }: { crowding: TimeSlot['crowding'] }) {
  const config = {
    low: { label: '空闲', className: 'bg-govGreen/10 text-govGreen' },
    medium: { label: '适中', className: 'bg-govOrange/10 text-govOrange' },
    high: { label: '拥挤', className: 'bg-govRed/10 text-govRed' },
  }
  const c = config[crowding]
  return <span className={cn('gov-badge', c.className)}>{c.label}</span>
}

export default function Appointment() {
  const { halls, timeSlots, appointments, bookAppointment, cancelAppointment } = useGovStore()
  const [selectedHall, setSelectedHall] = useState('')
  const [selectedDate, setSelectedDate] = useState(getNext7Days()[0].value)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const days = getNext7Days()
  const selectedHallData = halls.find((h) => h.id === selectedHall)
  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'booked' || a.status === 'checked_in'
  )

  const handleBook = () => {
    if (!selectedHall || !selectedTimeSlot || !selectedService) return
    bookAppointment(selectedHall, selectedService, selectedDate, selectedTimeSlot)
    setBookingSuccess(true)
    setTimeout(() => setBookingSuccess(false), 3000)
    setSelectedHall('')
    setSelectedTimeSlot('')
    setSelectedService('')
  }

  const handleCancel = (id: string) => {
    cancelAppointment(id)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif font-semibold text-gray-900">预约办事</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="gov-card space-y-5">
          <h2 className="text-lg font-serif font-semibold text-gray-800">预约办事</h2>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">办事大厅</label>
            <select
              className="gov-input"
              value={selectedHall}
              onChange={(e) => setSelectedHall(e.target.value)}
            >
              <option value="">请选择办事大厅</option>
              {halls.map((hall) => (
                <option key={hall.id} value={hall.id}>
                  {hall.name} - {hall.address}
                </option>
              ))}
            </select>
            {selectedHallData && (
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {selectedHallData.address}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  当前排队 {selectedHallData.todayQueue - selectedHallData.currentServing} 人
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">预约日期</label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {days.map((day) => (
                <button
                  key={day.value}
                  className={cn(
                    'shrink-0 rounded-lg border px-3 py-2 text-center text-sm transition-colors',
                    selectedDate === day.value
                      ? 'border-govBlue bg-govBlue text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-govBlue/50'
                  )}
                  onClick={() => setSelectedDate(day.value)}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">时间段</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot.time}
                  className={cn(
                    'relative rounded-lg border p-3 text-left text-sm transition-colors',
                    selectedTimeSlot === slot.label
                      ? 'border-govBlue bg-govBlue/5 ring-1 ring-govBlue'
                      : slot.available === 0
                        ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-50'
                        : 'border-gray-200 bg-white hover:border-govBlue/50'
                  )}
                  disabled={slot.available === 0}
                  onClick={() => setSelectedTimeSlot(slot.label)}
                >
                  {slot.recommended && (
                    <span className="absolute -top-2 -right-2 rounded-full bg-govOrange px-1.5 py-0.5 text-[10px] font-medium text-white">
                      推荐
                    </span>
                  )}
                  <div className="font-medium text-gray-800">{slot.label}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <CrowdingBadge crowding={slot.crowding} />
                    <span className="text-xs text-gray-400">余{slot.available}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    预计等候{slot.estimatedWait}分钟
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">服务类型</label>
            <select
              className="gov-input"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
            >
              <option value="">请选择服务类型</option>
              {serviceCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <button
            className={cn(
              'gov-btn-primary w-full flex items-center justify-center gap-2',
              (!selectedHall || !selectedTimeSlot || !selectedService) && 'opacity-50 cursor-not-allowed'
            )}
            disabled={!selectedHall || !selectedTimeSlot || !selectedService}
            onClick={handleBook}
          >
            {bookingSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                预约成功
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4" />
                立即预约
              </>
            )}
          </button>
        </div>

        <div className="gov-card space-y-4">
          <h2 className="text-lg font-serif font-semibold text-gray-800">我的预约</h2>
          {upcomingAppointments.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Calendar className="mx-auto h-12 w-12 mb-3 opacity-30" />
              <p>暂无预约记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="rounded-lg border border-gray-100 bg-gray-50/50 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">{apt.serviceType}</h3>
                      <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {apt.hallName}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'gov-badge',
                        apt.status === 'booked'
                          ? 'bg-govBlue/10 text-govBlue'
                          : 'bg-govGreen/10 text-govGreen'
                      )}
                    >
                      {apt.status === 'booked' ? '已预约' : '已签到'}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {apt.appointmentDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {apt.timeSlot}
                    </span>
                  </div>
                  {apt.status === 'booked' && (
                    <button
                      className="mt-3 flex items-center gap-1 text-sm text-govRed hover:underline"
                      onClick={() => handleCancel(apt.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                      取消预约
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
