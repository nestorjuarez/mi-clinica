'use client'

import { useState } from 'react'
import { useCreatePatient, useUpdatePatient } from '@/hooks/usePatients'
import { useRouter } from 'next/navigation'

interface PatientFormProps {
  initialData?: any
  patientId?: string
}

const inputClass = "w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5"

export default function PatientForm({ initialData, patientId }: PatientFormProps) {
  const router = useRouter()
  const createPatient = useCreatePatient()
  const updatePatient = useUpdatePatient()
  const isEditing = !!patientId

  const [form, setForm] = useState({
    dni: initialData?.dni ?? '',
    nombre: initialData?.nombre ?? '',
    apellido: initialData?.apellido ?? '',
    fechaNacimiento: initialData?.fechaNacimiento
      ? new Date(initialData.fechaNacimiento).toISOString().split('T')[0]
      : '',
    telefono: initialData?.telefono ?? '',
    email: initialData?.email ?? '',
    obraSocial: initialData?.obraSocial ?? '',
    numeroAfiliado: initialData?.numeroAfiliado ?? '',
    antecedentes: initialData?.antecedentes ?? '',
    alergias: initialData?.alergias ?? '',
    medicacionActual: initialData?.medicacionActual ?? '',
  })

  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    try {
      if (isEditing) {
        await updatePatient.mutateAsync({ id: patientId, data: form })
      } else {
        await createPatient.mutateAsync(form as any)
      }
      router.push('/dashboard/pacientes')
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? 'Error al guardar')
    }
  }

  const isPending = createPatient.isPending || updatePatient.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
          <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Datos personales */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Datos personales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>DNI *</label>
            <input
              name="dni"
              value={form.dni}
              onChange={handleChange}
              placeholder="12345678"
              required
              disabled={isEditing}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Fecha de nacimiento *</label>
            <input
              type="date"
              name="fechaNacimiento"
              value={form.fechaNacimiento}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Nombre *</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Juan"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Apellido *</label>
            <input
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              placeholder="García"
              required
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Teléfono</label>
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="351 123 4567"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="juan@email.com"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Obra social */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Cobertura médica</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Obra social</label>
            <input
              name="obraSocial"
              value={form.obraSocial}
              onChange={handleChange}
              placeholder="OSDE, Swiss Medical..."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Número de afiliado</label>
            <input
              name="numeroAfiliado"
              value={form.numeroAfiliado}
              onChange={handleChange}
              placeholder="123456789"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Antecedentes */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Antecedentes médicos</h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Antecedentes personales</label>
            <textarea
              name="antecedentes"
              value={form.antecedentes}
              onChange={handleChange}
              placeholder="HTA, DBT, cirugías previas..."
              rows={3}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Alergias</label>
            <textarea
              name="alergias"
              value={form.alergias}
              onChange={handleChange}
              placeholder="Penicilina, AINEs..."
              rows={2}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Medicación actual</label>
            <textarea
              name="medicacionActual"
              value={form.medicacionActual}
              onChange={handleChange}
              placeholder="Enalapril 10mg, Metformina 850mg..."
              rows={2}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition"
        >
          {isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear paciente'}
        </button>
      </div>
    </form>
  )
}