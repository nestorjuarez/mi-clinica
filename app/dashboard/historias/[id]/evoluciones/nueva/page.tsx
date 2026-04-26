'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const inputClass = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5'

export default function NuevaEvolucionPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [form, setForm] = useState({
    subjetivo: '',
    objetivo: '',
    evaluacion: '',
    plan: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`/api/historias/${params.id}/evoluciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error al guardar evolución')
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
        <h1 className="text-2xl font-bold text-slate-900">Nueva evolución</h1>
        <p className="text-slate-500 text-sm mt-1">Formato SOAP</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
            <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-md flex items-center justify-center text-xs font-bold">S</span>
              <label className="text-sm font-semibold text-slate-700">Subjetivo</label>
            </div>
            <textarea
              name="subjetivo"
              value={form.subjetivo}
              onChange={handleChange}
              rows={5}
              placeholder="Lo que refiere el paciente, síntomas, quejas..."
              className={inputClass}
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 bg-green-100 text-green-700 rounded-md flex items-center justify-center text-xs font-bold">O</span>
              <label className="text-sm font-semibold text-slate-700">Objetivo</label>
            </div>
            <textarea
              name="objetivo"
              value={form.objetivo}
              onChange={handleChange}
              rows={5}
              placeholder="Examen físico, signos vitales, datos objetivos..."
              className={inputClass}
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 bg-amber-100 text-amber-700 rounded-md flex items-center justify-center text-xs font-bold">A</span>
              <label className="text-sm font-semibold text-slate-700">Evaluación</label>
            </div>
            <textarea
              name="evaluacion"
              value={form.evaluacion}
              onChange={handleChange}
              rows={5}
              placeholder="Diagnóstico, impresión clínica..."
              className={inputClass}
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-md flex items-center justify-center text-xs font-bold">P</span>
              <label className="text-sm font-semibold text-slate-700">Plan</label>
            </div>
            <textarea
              name="plan"
              value={form.plan}
              onChange={handleChange}
              rows={5}
              placeholder="Plan terapéutico, indicaciones, próximos pasos..."
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
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
            {loading ? 'Guardando...' : 'Guardar evolución'}
          </button>
        </div>
      </form>
    </div>
  )
}