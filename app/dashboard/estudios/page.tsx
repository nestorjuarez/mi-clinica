import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function EstudiosPage() {
  const session = await getServerSession(authOptions)
  const orgId = (session?.user as any)?.orgId

  const estudios = await prisma.study.findMany({
    where: { orgId },
    include: {
      medicalRecord: {
        include: {
          patient: { select: { nombre: true, apellido: true, dni: true, id: true } },
        },
      },
      professional: { select: { name: true } },
    },
    orderBy: { fecha: 'desc' },
  })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Estudios</h1>
        <p className="text-slate-500 text-sm mt-1">{estudios.length} estudios registrados</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {estudios.length === 0 ? (
          <div className="py-16 text-center">
            <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <p className="text-slate-400 text-sm">No hay estudios registrados</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Paciente</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Tipo</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Descripción</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Profesional</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Fecha</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {estudios.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">
                      {st.medicalRecord.patient.apellido}, {st.medicalRecord.patient.nombre}
                    </p>
                    <p className="text-xs text-slate-400">DNI: {st.medicalRecord.patient.dni}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                      {st.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{st.descripcion}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{st.professional.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {format(new Date(st.fecha), 'd/MM/yyyy', { locale: es })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {st.archivoUrl && (
                        <a
                          href={st.archivoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-green-600 hover:text-green-700 px-2.5 py-1.5 rounded-md hover:bg-green-50 transition"
                        >
                          Ver archivo
                        </a>
                      )}
                      <Link
                        href={`/dashboard/pacientes/${st.medicalRecord.patient.id}`}
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
