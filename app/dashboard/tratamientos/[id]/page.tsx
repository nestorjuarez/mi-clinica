'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const inputClass = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5'

const ESTADO_COLORS: Record<string, string> = {
  ACTIVO: 'bg-green-50 text-green-700',
  PAUSADO: 'bg-amber-50 text-amber-700',
  FINALIZADO: 'bg-slate-100 text-slate-500',
}

export default function TratamientoDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const qc = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<any>(null)
  const [error, setError] = useState('')

  const { data: tratamiento, isLoading } = useQuery({
    queryKey: ['tratamiento', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/tratamientos/${params.id}`)
      if (!res.ok) throw new Error('Error al cargar')
      return res.json()
    },
    onSuccess: (data: any) => {
      setForm({
        nombre: data.nombre,
        descripcion: data.descripcion ?? '',
        fechaInicio: new Date(data.fechaInicio).toISOString().split('T')[0],
        fechaFin: data.fechaFin ? new Date(data.fechaFin).toISOString().split('T')[0] : '',
        estado: data.estado,
        observaciones: data.observaciones ?? '',
      })
    },
  } as any)

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/tratamientos/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Error al actualizar')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tratamiento', params.id] })
      setEditing(false)
    },
  })

  const finalizarMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tratamientos/${params.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Error al finalizar')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tratamiento', params.id] })
    },
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev: any) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await updateMutation.mutateAsync(form)
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleFinalizar() {
    if (!confirm('¿Finalizar este tratamiento?')) return
    await finalizarMutation.mutateAsync()
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!tratamiento) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-400">Tratamiento no encontrado</p>
      </div>
    )
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{tratamiento.nombre}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ESTADO_COLORS[tratamiento.estado]}`}>
                {tratamiento.estado}
              </span>
              <span className="text-xs text-slate-400">
                Desde {format(new Date(tratamiento.fechaInicio), "d/MM/yyyy", { locale: es })}
                {tratamiento.fechaFin && ` hasta ${format(new Date(tratamiento.fechaFin), "d/MM/yyyy", { locale: es })}`}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {tratamiento.estado !== 'FINALIZADO' && (
              <button
                onClick={handleFinalizar}
                className="px-3 py-2 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition"
              >
                Finalizar
              </button>
            )}
            <button
              onClick={() => setEditing(!editing)}
              className="px-3 py-2 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              {editing ? 'Cancelar' : 'Editar'}
            </button>
          </div>
        </div>
      </div>

      {editing && form ? (
        <form onSubmit={handleSave} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div>
              <label className={labelClass}>Nombre *</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Descripción</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={2} className={inputClass} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Fecha inicio</label>
                <input type="date" name="fechaInicio" value={form.fechaInicio} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Fecha fin</label>
                <input type="date" name="fechaFin" value={form.fechaFin} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Estado</label>
                <select name="estado" value={form.estado} onChange={handleChange} className={inputClass}>
                  <option value="ACTIVO">Activo</option>
                  <option value="PAUSADO">Pausado</option>
                  <option value="FINALIZADO">Finalizado</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Observaciones</label>
              <textarea name="observaciones" value={form.observaciones} onChange={handleChange} rows={3} className={inputClass} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setEditing(false)} className="px-4 py-2.5 text-sm text-slate-600">
              Cancelar
            </button>
            <button type="submit" disabled={updateMutation.isPending} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition">
              {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          {tratamiento.descripcion && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Descripción</p>
              <p className="text-sm text-slate-700">{tratamiento.descripcion}</p>
            </div>
          )}
          {tratamiento.observaciones && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Observaciones</p>
              <p className="text-sm text-slate-700">{tratamiento.observaciones}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Fecha de inicio</p>
              <p className="text-sm text-slate-700">
                {format(new Date(tratamiento.fechaInicio), "d 'de' MMMM yyyy", { locale: es })}
              </p>
            </div>
            {tratamiento.fechaFin && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Fecha de fin</p>
                <p className="text-sm text-slate-700">
                  {format(new Date(tratamiento.fechaFin), "d 'de' MMMM yyyy", { locale: es })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
