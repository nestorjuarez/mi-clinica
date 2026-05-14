'use client'

import { useState } from 'react'
import { format, addDays, startOfWeek, addWeeks, subWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAppointments, useCancelAppointment, useUpdateAppointment } from '@/hooks/useAppointments'
import AppointmentModal from '@/components/appointments/AppointmentModal'

const HOURS = Array.from({ length: 24 }, (_, i) => i).filter(h => h >= 8 && h <= 19)
const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-amber-50 border-amber-300 text-amber-800',
  CONFIRMADO: 'bg-green-50 border-green-300 text-green-800',
  CANCELADO: 'bg-red-50 border-red-300 text-red-500 line-through',
  COMPLETADO: 'bg-blue-50 border-blue-300 text-blue-800',
  AUSENTE: 'bg-slate-50 border-slate-300 text-slate-500',
}

export default function AgendaPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showModal, setShowModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ fecha: string; hora: string } | null>(null)

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i))

  const { data: appointments = [], isLoading } = useAppointments({
    fecha: selectedDate,
  })

  const cancelAppointment = useCancelAppointment()
  const updateAppointment = useUpdateAppointment()

  function handleDayClick(date: Date) {
    setSelectedDate(format(date, 'yyyy-MM-dd'))
  }

  function handleSlotClick(hora: number) {
    const fechaHora = `${selectedDate}T${String(hora).padStart(2, '0')}:00:00`
    setSelectedSlot({ fecha: selectedDate, hora: fechaHora })
    setShowModal(true)
  }

  async function handleCancel(id: string) {
    if (!confirm('¿Cancelar este turno?')) return
    await cancelAppointment.mutateAsync(id)
  }

  async function handleChangeEstado(id: string, estado: string) {
    await updateAppointment.mutateAsync({ id, data: { estado } as any })
  }

  const getAppointmentForHour = (hora: number) => {
    return appointments.filter((a: any) => {
      const h = new Date(a.fechaHora).getHours()
      return h === hora
    })
  }

  const isHourBlocked = (hora: number) => {
    return appointments.some((a: any) => {
      const h = new Date(a.fechaHora).getHours()
      return h === hora && (a.estado === 'PENDIENTE' || a.estado === 'CONFIRMADO')
    })
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agenda</h1>
          <p className="text-slate-500 text-sm mt-1">
            {format(new Date(selectedDate + 'T12:00:00'), "EEEE d 'de' MMMM yyyy", { locale: es })}
          </p>
        </div>
        <button
          onClick={() => { setSelectedSlot(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo turno
        </button>
      </div>

      {/* Navegación semanal */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium text-slate-700">
            {format(weekStart, "MMMM yyyy", { locale: es })}
          </span>
          <button
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-6 gap-1">
          {weekDays.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const isSelected = dateStr === selectedDate
            const isToday = dateStr === format(new Date(), 'yyyy-MM-dd')
            return (
              <button
                key={dateStr}
                onClick={() => handleDayClick(day)}
                className={`flex flex-col items-center py-2 px-1 rounded-lg transition ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : isToday
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span className="text-xs font-medium">
                  {format(day, 'EEE', { locale: es })}
                </span>
                <span className={`text-lg font-bold mt-0.5 ${isSelected ? 'text-white' : ''}`}>
                  {format(day, 'd')}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Vista de turnos del día */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-50">
          <p className="text-sm font-semibold text-slate-700">
            {appointments.length} turno{appointments.length !== 1 ? 's' : ''} para hoy
          </p>
        </div>

        {isLoading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-slate-400 text-sm">Cargando agenda...</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {HOURS.map((hora) => {
              const turnos = getAppointmentForHour(hora)
              const bloqueado = isHourBlocked(hora)

              return (
                <div
                key={hora}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 px-4 sm:px-6 py-3 hover:bg-slate-50 transition-colors group"
                >
                  {/* Hora */}
                  <div className="sm:w-16 shrink-0 pt-1">
                    <span className="text-xs font-semibold text-slate-400">
                      {String(hora).padStart(2, '0')}:00
                    </span>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-h-[48px]">
                    <div className="space-y-2">
                      {/* Turnos del horario */}
                      {turnos.map((turno: any) => (
                        <div
                        key={turno.id}
                        className={`flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-lg border ${ESTADO_COLORS[turno.estado]}`}
                      >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                              <span className="text-xs font-bold text-slate-600">
                                {turno.patient.apellido.charAt(0)}{turno.patient.nombre.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold">
                                {turno.patient.apellido}, {turno.patient.nombre}
                              </p>
                              <p className="text-xs opacity-70">
                                {turno.motivoConsulta ?? 'Sin motivo especificado'} · {turno.duracionMin} min
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              value={turno.estado}
                              onChange={(e) => handleChangeEstado(turno.id, e.target.value)}
                              className="text-xs border-0 bg-transparent font-medium focus:outline-none cursor-pointer"
                            >
                              <option value="PENDIENTE">Pendiente</option>
                              <option value="CONFIRMADO">Confirmado</option>
                              <option value="COMPLETADO">Completado</option>
                              <option value="AUSENTE">Ausente</option>
                              <option value="CANCELADO">Cancelado</option>
                            </select>
                            <button
                              onClick={() => handleCancel(turno.id)}
                              className="p-1 hover:bg-white rounded transition opacity-60 hover:opacity-100"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Botón agregar si el horario no está bloqueado */}
                      {!bloqueado && (
                        <button
                          onClick={() => handleSlotClick(hora)}
                          className="w-full min-h-[48px] border border-dashed border-slate-200 rounded-lg text-xs text-slate-300 hover:border-blue-300 hover:text-blue-400 hover:bg-blue-50 transition opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Agregar turno
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <AppointmentModal
          initialDate={selectedSlot?.fecha ?? selectedDate}
          initialHora={selectedSlot?.hora}
          onClose={() => { setShowModal(false); setSelectedSlot(null) }}
        />
      )}
    </div>
  )
}
