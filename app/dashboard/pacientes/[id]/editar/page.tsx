import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PatientForm from '@/components/patients/PatientForm'
import Link from 'next/link'

export default async function EditarPacientePage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  const orgId = (session?.user as any)?.orgId

  const patient = await prisma.patient.findFirst({
    where: { id: params.id, orgId, active: true },
  })

  if (!patient) notFound()

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/dashboard/pacientes/${params.id}`}
          className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-3"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al perfil
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Editar paciente</h1>
        <p className="text-slate-500 text-sm mt-1">
          {patient.apellido}, {patient.nombre}
        </p>
      </div>
      <PatientForm initialData={patient} patientId={patient.id} />
    </div>
  )
}