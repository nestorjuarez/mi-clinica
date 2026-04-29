import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ESTADO_COLORS: Record<string, string> = {
  ACTIVO: 'bg-green-50 text-green-700',
  PAUSADO: 'bg-amber-50 text-amber-700',
  FINALIZADO: 'bg-slate-100 text-slate-500',
}

export default async function TratamientosPage() {
  const session = await getServerSession(authOptions)
  const orgId = (session?.user as any)?.orgId

  const tratamientos = await prisma.treatment.findMany({
    where: {
      orgId,
      medicalRecord: { patient: { active: true } },
    },
    include: {
      medicalRecord: {
        include: {
          patient: { select: { id: true, nombre: true, apellido: true, dni: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Tratamientos</h1>
        <p className="text-slate-500 text-sm mt-1">{tratamientos.length} tratamientos registrados</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {tratamientos.length === 0 ? (
          <div className="py-16 text-center">
            <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-400 text-sm">No hay tratamientos registrados</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Paciente</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Tratamiento</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Inicio</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Fin</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Estado</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tratamientos.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">
                      {t.medicalRecord.patient.apellido}, {t.medicalRecord.patient.nombre}
                    </p>
                    <p className="text-xs text-slate-400">DNI: {t.medicalRecord.patient.dni}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">{t.nombre}</p>
                    {t.descripcion && (
                      <p className="text-xs text-slate-400 mt-0.5">{t.descripcion}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {format(new Date(t.fechaInicio), 'd/MM/yyyy', { locale: es })}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {t.fechaFin
                      ? format(new Date(t.fechaFin), 'd/MM/yyyy', { locale: es })
                      : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ESTADO_COLORS[t.estado]}`}>
                      {t.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/pacientes/${t.medicalRecord.patient.id}`}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 px-2.5 py-1.5 rounded-md hover:bg-blue-50 transition"
                    >
                      Ver paciente
                    </Link>
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
