import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { differenceInYears, format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import PatientTabs from '@/components/patients/PatientTabs'

export default async function PatientProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  const orgId = (session?.user as any)?.orgId

  const patient = await prisma.patient.findFirst({
    where: { id: params.id, orgId, active: true },
    include: {
      medicalRecords: {
        include: {
          evolutions: {
            orderBy: { fecha: 'desc' },
            take: 5,
            include: { professional: { select: { name: true } } },
          },
          prescriptions: {
            orderBy: { fecha: 'desc' },
            take: 5,
            include: { professional: { select: { name: true } } },
          },
          studies: {
            orderBy: { fecha: 'desc' },
            take: 5,
          },
          treatments: {
            where: { estado: 'ACTIVO' },
          },
          professional: { select: { name: true } },
        },
      },
      appointments: {
        orderBy: { fechaHora: 'desc' },
        take: 5,
        include: { professional: { select: { name: true } } },
      },
    },
  })

  if (!patient) notFound()

  const edad = differenceInYears(new Date(), new Date(patient.fechaNacimiento))
  const medicalRecord = patient.medicalRecords[0] ?? null

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <Link
        href="/dashboard/pacientes"
        className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver a pacientes
      </Link>

      {/* Header del paciente */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-blue-700">
                {patient.apellido.charAt(0)}{patient.nombre.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {patient.apellido}, {patient.nombre}
              </h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-sm text-slate-500">DNI: {patient.dni}</span>
                <span className="text-slate-300">·</span>
                <span className="text-sm text-slate-500">{edad} años</span>
                <span className="text-slate-300">·</span>
                <span className="text-sm text-slate-500">
                  Nacido el {format(new Date(patient.fechaNacimiento), "d 'de' MMMM 'de' yyyy", { locale: es })}
                </span>
              </div>
            </div>
          </div>
          <Link
            href={`/dashboard/pacientes/${patient.id}/editar`}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </Link>
        </div>

        {/* Info rápida */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-400 mb-1">Teléfono</p>
            <p className="text-sm font-medium text-slate-900">{patient.telefono ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Email</p>
            <p className="text-sm font-medium text-slate-900 truncate">{patient.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Obra social</p>
            <p className="text-sm font-medium text-slate-900">{patient.obraSocial ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">N° afiliado</p>
            <p className="text-sm font-medium text-slate-900">{patient.numeroAfiliado ?? '—'}</p>
          </div>
        </div>

        {/* Alertas médicas */}
        {(patient.alergias || patient.medicacionActual) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {patient.alergias && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-100">
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-red-700">Alergias</p>
                  <p className="text-xs text-red-600 mt-0.5">{patient.alergias}</p>
                </div>
              </div>
            )}
            {patient.medicacionActual && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-blue-700">Medicación actual</p>
                  <p className="text-xs text-blue-600 mt-0.5">{patient.medicacionActual}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs con HC, evoluciones, recetas, estudios, turnos */}
      <PatientTabs
        patient={patient}
        medicalRecord={medicalRecord}
      />
    </div>
  )
}