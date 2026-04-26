'use client'

import { useState, useEffect } from 'react'
import { useCreateAppointment, useDisponibilidad } from '@/hooks/useAppointments'
import { usePatients } from '@/hooks/usePatients'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface AppointmentModalProps {
  initialDate: string
  initialHora?: string
  onClose: () => void
}

export default function AppointmentModal({
  initialDate,
  initialHora,
  onClose,
}: AppointmentModalProps) {
  const [form, setForm] = useState({
    patientId: '',
    professionalId: '',
    fechaHora: initialHora ?? '',
    duracionMin: 30,
    motivoConsulta: '',
    observaciones: '',
  })
  const [fecha, setFecha] = useState(initialDate)
  const [searchPaciente, setSearchPaciente] = useState('')
  const [error, setError] = useState('')

  const createAppointment = useCreateAppointment()
  const { data: patientsData } = usePatients(searchPaciente, 1)
  const { data: slots = [] } = useDisponibilidad(form.professionalId, fecha)

  // Profesionales — en producción vendría de una API
  const [profesionales, setProfesionales] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    fetch('/api/usuarios?role=MEDICO')
      .then((r) => r.json())
      .then((data) => setProfesionales(data))
      .catch(() => {})
  }, [])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === 'duracionMin' ? Number(value) : value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.patientId) return setError('Seleccioná un paciente')
    if (!form.professionalId) return setError('Seleccioná un profesional')
    if (!form.fechaHora) return setError('Seleccioná un horario')

    try {
      await createAppointment.mutateAsync(form)
      onClose()
    } catch (err: any) {
      setError(err.message ?? 'Error al crear turno')
    }
  }

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Nuevo turno</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Paciente */}
          <div>
            <label className={labelClass}>Paciente *</label>
            <input
              placeholder="Buscar por nombre o DNI..."
              value={searchPaciente}
              onChange={(e) => setSearchPaciente(e.target.value)}
              className={inputClass}
            />
            {searchPaciente && patientsData?.data && patientsData.data.length > 0 && (
              <div className="mt-1 border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                {patientsData.data.slice(0, 5).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, patientId: p.id }))
                      setSearchPaciente(`${p.apellido}, ${p.nombre}`)
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition text-sm border-b border-slate-100 last:border-0"
                  >
                    <span className="font-medium">{p.apellido}, {p.nombre}</span>
                    <span className="text-slate-400 ml-2">DNI: {p.dni}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Profesional */}
          <div>
            <label className={labelClass}>Profesional *</label>
            <select
              name="professionalId"
              value={form.professionalId}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Seleccioná un profesional</option>
              {profesionales.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className={labelClass}>Fecha *</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => {
                setFecha(e.target.value)
                setForm((prev) => ({ ...prev, fechaHora: '' }))
              }}
              className={inputClass}
            />
          </div>

          {/* Slots disponibles */}
          {form.professionalId && fecha && (
            <div>
              <label className={labelClass}>Horario disponible *</label>
              {slots.length === 0 ? (
                <p className="text-sm text-slate-400 py-2">
                  No hay turnos disponibles para este día
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {slots.map((slot) => {
                    const hora = format(new Date(slot), 'HH:mm')
                    const isSelected = form.fechaHora === slot
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, fechaHora: slot }))}
                        className={`py-2 text-sm font-medium rounded-lg border transition ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        {hora}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Duración */}
          <div>
            <label className={labelClass}>Duración</label>
            <select
              name="duracionMin"
              value={form.duracionMin}
              onChange={handleChange}
              className={inputClass}
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>1 hora</option>
            </select>
          </div>

          {/* Motivo */}
          <div>
            <label className={labelClass}>Motivo de consulta</label>
            <input
              name="motivoConsulta"
              value={form.motivoConsulta}
              onChange={handleChange}
              placeholder="Control, consulta, urgencia..."
              className={inputClass}
            />
          </div>

          {/* Observaciones */}
          <div>
            <label className={labelClass}>Observaciones</label>
            <textarea
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
              rows={2}
              placeholder="Notas adicionales..."
              className={inputClass}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createAppointment.isPending}
              className="flex-1 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
            >
              {createAppointment.isPending ? 'Guardando...' : 'Confirmar turno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}