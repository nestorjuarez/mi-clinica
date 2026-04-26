import PatientForm from '@/components/patients/PatientForm'
import Link from 'next/link'

export default function NuevoPacientePage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/pacientes"
          className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-3"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a pacientes
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nuevo paciente</h1>
        <p className="text-slate-500 text-sm mt-1">Completá los datos del paciente</p>
      </div>
      <PatientForm />
    </div>
  )
}