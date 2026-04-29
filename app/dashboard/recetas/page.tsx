import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function RecetasPage() {
  const session = await getServerSession(authOptions)
  const orgId = (session?.user as any)?.orgId

  const recetas = await prisma.prescription.findMany({
    where: { orgId, medicalRecord: { patient: { active: true } } },
    include: {
      medicalRecord: {
        include: {
          patient: { select: { id: true, nombre: true, apellido: true, dni: true } },
        },
      },
      professional: { select: { name: true } },
      items: true,
    },
    orderBy: { fecha: 'desc' },
  })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Recetas</h1>
        <p className="text-slate-500 text-sm mt-1">{recetas.length} recetas emitidas</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {recetas.length === 0 ? (
          <div className="py-16 text-center">
            <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-slate-400 text-sm">No hay recetas emitidas</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Paciente</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Medicamentos</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Profesional</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Fecha</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Estado</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recetas.map((rx) => (
                <tr key={rx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">
                      {rx.medicalRecord.patient.apellido}, {rx.medicalRecord.patient.nombre}
                    </p>
                    <p className="text-xs text-slate-400">DNI: {rx.medicalRecord.patient.dni}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      {rx.items.slice(0, 2).map((item: any) => (
                        <p key={item.id} className="text-xs text-slate-600">
                          {item.nombre} {item.dosis} — {item.frecuencia}
                        </p>
                      ))}
                      {rx.items.length > 2 && (
                        <p className="text-xs text-slate-400">+{rx.items.length - 2} más</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{rx.professional.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {format(new Date(rx.fecha), 'd/MM/yyyy', { locale: es })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      rx.estado === 'ACTIVA' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {rx.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
  <div className="flex items-center justify-end gap-2">
    <a
      href={`/api/recetas/${rx.id}/pdf`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs font-medium text-green-600 hover:text-green-700 px-2.5 py-1.5 rounded-md hover:bg-green-50 transition"
    >
      Imprimir PDF
    </a>
    <Link
      href={`/dashboard/pacientes/${rx.medicalRecord.patient.id}`}
      className="text-xs font-medium text-blue-600 hover:text-blue-700 px-2.5 py-1.5 rounded-md hover:bg-blue-50 transition"
    >
      Ver paciente
    </Link>
  </div>
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
