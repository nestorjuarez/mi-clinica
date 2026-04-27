'use client'

import { useState, useEffect } from 'react'

const inputClass = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5'

export default function ConfiguracionPage() {
  const [form, setForm] = useState({ nombre: '', slug: '', plan: '' })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    fetch('/api/admin/organizacion')
      .then((r) => r.json())
      .then((data) => {
        setForm({ nombre: data.nombre, slug: data.slug, plan: data.plan })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSaving(true)

    try {
      const res = await fetch('/api/admin/organizacion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error al guardar')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-slate-500 text-sm mt-1">Datos de tu organización</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-lg">
            <p className="text-sm text-green-600">✓ Cambios guardados correctamente</p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div>
            <label className={labelClass}>Nombre de la organización *</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Clínica San Martín"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Slug</label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="clinica-san-martin"
              className={inputClass}
            />
            <p className="text-xs text-slate-400 mt-1">Identificador único, solo letras minúsculas y guiones</p>
          </div>

          <div>
            <label className={labelClass}>Plan</label>
            <select
              name="plan"
              value={form.plan}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="BASIC">Basic</option>
              <option value="PRO">Pro</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
