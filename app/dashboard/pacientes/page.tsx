'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePatients, useDeletePatient } from '@/hooks/usePatients'
import { differenceInYears } from 'date-fns'

export default function PacientesPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')

  const { data, isLoading, isError } = usePatients(query, page)
  const deletePatient = useDeletePatient()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setQuery(search)
    setPage(1)
  }

  async function handleDelete(id: string, nombre: string) {
    if (!confirm(`¿Eliminar a ${nombre}? Esta acción no se puede deshacer.`)) return
    await deletePatient.mutateAsync(id)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Pacientes
          </h1>

          <p className="text-slate-500 text-sm mt-1">
            {data?.pagination.total ?? 0} pacientes registrados
          </p>
        </div>

        <Link
          href="/dashboard/pacientes/nuevo"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>

          Nuevo paciente
        </Link>
      </div>

      {/* Búsqueda */}
      <form
        onSubmit={handleSearch}
        className="mb-6 flex flex-col sm:flex-row gap-2"
      >
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, apellido o DNI..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition"
        >
          Buscar
        </button>

        {query && (
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setQuery('')
              setPage(1)
            }}
            className="w-full sm:w-auto px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition"
          >
            Limpiar
          </button>
        )}
      </form>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">

        {isLoading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />

            <p className="text-slate-400 text-sm">
              Cargando pacientes...
            </p>
          </div>
        ) : isError ? (
          <div className="py-16 text-center">
            <p className="text-red-500 text-sm">
              Error al cargar pacientes
            </p>
          </div>
        ) : data?.data.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-400 text-sm">
              {query
                ? 'No se encontraron pacientes'
                : 'No hay pacientes registrados'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">
                      Paciente
                    </th>

                    <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">
                      DNI
                    </th>

                    <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">
                      Edad
                    </th>

                    <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">
                      Teléfono
                    </th>

                    <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">
                      Obra social
                    </th>

                    <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {data?.data.map((patient) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-blue-700">
                              {patient.apellido.charAt(0)}
                              {patient.nombre.charAt(0)}
                            </span>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {patient.apellido}, {patient.nombre}
                            </p>

                            <p className="text-xs text-slate-400">
                              {patient.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {patient.dni}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {differenceInYears(
                          new Date(),
                          new Date(patient.fechaNacimiento)
                        )}{' '}
                        años
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {patient.telefono ?? '—'}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {patient.obraSocial ?? '—'}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/pacientes/${patient.id}`}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700 px-2.5 py-1.5 rounded-md hover:bg-blue-50 transition"
                          >
                            Ver
                          </Link>

                          <Link
                            href={`/dashboard/pacientes/${patient.id}/editar`}
                            className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition"
                          >
                            Editar
                          </Link>

                          <button
                            onClick={() =>
                              handleDelete(
                                patient.id,
                                `${patient.nombre} ${patient.apellido}`
                              )
                            }
                            className="text-xs font-medium text-red-500 hover:text-red-700 px-2.5 py-1.5 rounded-md hover:bg-red-50 transition"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {data && data.pagination.pages > 1 && (
              <div className="px-4 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  Mostrando {(page - 1) * data.pagination.limit + 1} -{' '}
                  {Math.min(
                    page * data.pagination.limit,
                    data.pagination.total
                  )}{' '}
                  de {data.pagination.total}
                </p>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50 transition"
                  >
                    Anterior
                  </button>

                  <button
                    onClick={() =>
                      setPage((p) =>
                        Math.min(data.pagination.pages, p + 1)
                      )
                    }
                    disabled={page === data.pagination.pages}
                    className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50 transition"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}