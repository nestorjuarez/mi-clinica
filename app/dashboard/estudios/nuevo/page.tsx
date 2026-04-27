'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const inputClass = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5'

const TIPOS = ['LABORATORIO', 'IMAGEN', 'ELECTROCARDIOGRAMA', 'ESPIROMETRIA', 'OTRO']

export default function NuevoEstudioPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const medicalRecordId = searchParams.get('medicalRecordId') ?? ''

  const [form, setForm] = useState({
    tipo: 'LABORATORIO',
    descripcion: '',
    resultado: '',
    laboratorio: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.descripcion.trim()) {
      setError('La descripción es obligatoria')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/historias/${medicalRecordId}/estudios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error al guardar estudio')
      }

      router.back()
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-3"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Nuevo estudio</h1>
        <p className="text-slate-500 text-sm mt-1">Registrá el estudio del paciente</p>
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
          <h3 className="font-semibold text-slate-900">Datos del estudio</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tipo de estudio *</label>
              <select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                className={inputClass}
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Laboratorio / Centro</label>
              <input
                name="laboratorio"
                value={form.laboratorio}
                onChange={handleChange}
                placeholder="Nombre del laboratorio o centro"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Descripción *</label>
            <input
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Ej: Hemograma completo, Rx tórax, Eco abdominal..."
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Resultado</label>
            <textarea
              name="resultado"
              value={form.resultado}
              onChange={handleChange}
              rows={4}
              placeholder="Transcribí el resultado o resumen del informe..."
              className={inputClass}
            />
          </div>
        </div>

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
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition"
          >
            {loading ? 'Guardando...' : 'Guardar estudio'}
          </button>
        </div>
      </form>
    </div>
  )
}
