'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const inputClass = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5'

export default function NuevaHistoriaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientId = searchParams.get('patientId') ?? ''

  const [form, setForm] = useState({
    motivoConsulta: '',
    diagnostico: '',
    tratamiento: '',
    observaciones: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/historias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, ...form }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error al crear historia clínica')
      }

      router.push(`/dashboard/pacientes/${patientId}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/dashboard/pacientes/${patientId}`}
          className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-3"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al paciente
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nueva historia clínica</h1>
        <p className="text-slate-500 text-sm mt-1">Completá los datos iniciales</p>
      </div>

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

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h3 className="font-semibold text-slate-900">Datos de apertura</h3>

          <div>
            <label className={labelClass}>Motivo de consulta</label>
            <textarea
              name="motivoConsulta"
              value={form.motivoConsulta}
              onChange={handleChange}
              rows={3}
              placeholder="Describí el motivo de consulta inicial..."
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Diagnóstico inicial</label>
            <textarea
              name="diagnostico"
              value={form.diagnostico}
              onChange={handleChange}
              rows={3}
              placeholder="Diagnóstico presuntivo o definitivo..."
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Tratamiento indicado</label>
            <textarea
              name="tratamiento"
              value={form.tratamiento}
              onChange={handleChange}
              rows={3}
              placeholder="Tratamiento indicado..."
              className={inputClass}
            />
          </div>

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
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            href={`/dashboard/pacientes/${patientId}`}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition"
          >
            {loading ? 'Creando...' : 'Crear historia clínica'}
          </button>
        </div>
      </form>
    </div>
  )
}