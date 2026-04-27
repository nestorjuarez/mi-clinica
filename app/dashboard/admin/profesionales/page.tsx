'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  MEDICO: 'Médico',
  RECEPCIONISTA: 'Recepcionista',
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-50 text-purple-700',
  MEDICO: 'bg-blue-50 text-blue-700',
  RECEPCIONISTA: 'bg-green-50 text-green-700',
}

export default function ProfesionalesPage() {
  const qc = useQueryClient()

  const { data: profesionales = [], isLoading } = useQuery({
    queryKey: ['profesionales'],
    queryFn: async () => {
      const res = await fetch('/api/admin/profesionales')
      if (!res.ok) throw new Error('Error al cargar profesionales')
      return res.json()
    },
  })

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const res = await fetch(`/api/admin/profesionales/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      })
      if (!res.ok) throw new Error('Error al actualizar')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profesionales'] }),
  })

  async function handleToggle(id: string, currentActive: boolean) {
    const accion = currentActive ? 'desactivar' : 'activar'
    if (!confirm(`¿Querés ${accion} este usuario?`)) return
    await toggleActive.mutateAsync({ id, active: !currentActive })
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profesionales</h1>
          <p className="text-slate-500 text-sm mt-1">
            {profesionales.length} usuarios registrados
          </p>
        </div>
        <Link
          href="/dashboard/admin/profesionales/nuevo"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo usuario
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-slate-400 text-sm">Cargando...</p>
          </div>
        ) : profesionales.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-400 text-sm">No hay profesionales registrados</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Usuario</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Rol</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Desde</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Estado</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profesionales.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-slate-600">
                          {p.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[p.role]}`}>
                      {ROLE_LABELS[p.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {format(new Date(p.createdAt), "d/MM/yyyy", { locale: es })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      p.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {p.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggle(p.id, p.active)}
                      className={`text-xs font-medium px-2.5 py-1.5 rounded-md transition ${
                        p.active
                          ? 'text-red-500 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {p.active ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
