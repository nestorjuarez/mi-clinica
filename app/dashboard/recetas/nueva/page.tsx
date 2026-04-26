'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const inputClass = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5'

interface MedItem {
  nombre: string
  dosis: string
  frecuencia: string
}

export default function NuevaRecetaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const medicalRecordId = searchParams.get('medicalRecordId') ?? ''

  const [items, setItems] = useState<MedItem[]>([
    { nombre: '', dosis: '', frecuencia: '' },
  ])
  const [indicaciones, setIndicaciones] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleItemChange(index: number, field: keyof MedItem, value: string) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  function addItem() {
    setItems((prev) => [...prev, { nombre: '', dosis: '', frecuencia: '' }])
  }

  function removeItem(index: number) {
    if (items.length === 1) return
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const validItems = items.filter((i) => i.nombre.trim())
    if (validItems.length === 0) {
      setError('Agregá al menos un medicamento')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/historias/${medicalRecordId}/recetas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: validItems, indicaciones }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error al crear receta')
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
        <h1 className="text-2xl font-bold text-slate-900">Nueva receta</h1>
        <p className="text-slate-500 text-sm mt-1">Prescripción médica</p>
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

        {/* Medicamentos */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Medicamentos</h3>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar medicamento
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500">
                    Medicamento {index + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Medicamento *</label>
                    <input
                      value={item.nombre}
                      onChange={(e) => handleItemChange(index, 'nombre', e.target.value)}
                      placeholder="Ej: Amoxicilina"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Dosis</label>
                    <input
                      value={item.dosis}
                      onChange={(e) => handleItemChange(index, 'dosis', e.target.value)}
                      placeholder="Ej: 500mg"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Frecuencia</label>
                    <input
                      value={item.frecuencia}
                      onChange={(e) => handleItemChange(index, 'frecuencia', e.target.value)}
                      placeholder="Ej: Cada 8 horas"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indicaciones */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Indicaciones</h3>
          <div>
            <label className={labelClass}>Indicaciones generales</label>
            <textarea
              value={indicaciones}
              onChange={(e) => setIndicaciones(e.target.value)}
              rows={3}
              placeholder="Instrucciones adicionales para el paciente..."
              className={inputClass}
            />
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
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition"
          >
            {loading ? 'Guardando...' : 'Emitir receta'}
          </button>
        </div>
      </form>
    </div>
  )
}