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
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return

    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    if (!allowedTypes.includes(selected.type)) {
      setError('Tipo de archivo no permitido. Solo JPG, PNG, PDF o Word')
      return
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError('El archivo no puede superar 10MB')
      return
    }

    setError('')
    setFile(selected)
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
      let archivoUrl = ''

      // Subir archivo si existe
      if (file) {
        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) {
          const data = await uploadRes.json()
          throw new Error(data.error ?? 'Error al subir el archivo')
        }

        const { url } = await uploadRes.json()
        archivoUrl = url
        setUploading(false)
      }

      // Guardar estudio
      const res = await fetch(`/api/historias/${medicalRecordId}/estudios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, archivoUrl }),
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
      setUploading(false)
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

        {/* Subida de archivo */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Archivo adjunto</h3>
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
              file ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
            }`}
          >
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-900">{file.name}</p>
                  <p className="text-xs text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="ml-2 text-xs text-red-500 hover:text-red-700"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <div>
                <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-slate-500 mb-1">
                  Arrastrá un archivo o hacé clic para seleccionar
                </p>
                <p className="text-xs text-slate-400">JPG, PNG, PDF o Word — máximo 10MB</p>
                <label className="mt-3 inline-block px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg cursor-pointer transition">
                  Seleccionar archivo
                  <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            )}
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
            disabled={loading || uploading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition flex items-center gap-2"
          >
            {uploading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Subiendo archivo...
              </>
            ) : loading ? 'Guardando...' : 'Guardar estudio'}
          </button>
        </div>
      </form>
    </div>
  )
}
