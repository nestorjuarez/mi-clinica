import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const orgId = (session?.user as any)?.orgId
  

  const [totalPacientes, turnosHoy, turnosPendientes] = await Promise.all([
    prisma.patient.count({ where: { orgId, active: true } }),
    prisma.appointment.count({
      where: {
        orgId,
        fechaHora: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
    prisma.appointment.count({
      where: { orgId, estado: 'PENDIENTE' },
    }),
  ])

  const turnosRecientes = await prisma.appointment.findMany({
    where: {
      orgId,
      fechaHora: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
        lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    },
    include: {
      patient: { select: { nombre: true, apellido: true } },
      professional: { select: { name: true } },
    },
    orderBy: { fechaHora: 'asc' },
    take: 5,
  })

  const nombre = session?.user?.name?.split(' ')[0]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Buen día, {nombre} 👋
        </h1>
        <p className="text-slate-500 mt-1">
          {new Date().toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-500">Total Pacientes</p>
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalPacientes}</p>
          <p className="text-xs text-slate-400 mt-1">pacientes activos</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-500">Turnos Hoy</p>
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{turnosHoy}</p>
          <p className="text-xs text-slate-400 mt-1">turnos programados</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-500">Pendientes</p>
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{turnosPendientes}</p>
          <p className="text-xs text-slate-400 mt-1">por confirmar</p>
        </div>
      </div>

      {/* Turnos de hoy */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Turnos de hoy</h2>
          <a href="/dashboard/agenda" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Ver agenda →
          </a>
        </div>

        {turnosRecientes.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-slate-400 text-sm">No hay turnos programados para hoy</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {turnosRecientes.map((turno) => (
              <div key={turno.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center w-14">
                    <p className="text-sm font-bold text-slate-900">
                      {new Date(turno.fechaHora).toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {turno.patient.apellido}, {turno.patient.nombre}
                    </p>
                    <p className="text-xs text-slate-400">
                      {turno.professional.name}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  turno.estado === 'CONFIRMADO'
                    ? 'bg-green-50 text-green-700'
                    : turno.estado === 'CANCELADO'
                    ? 'bg-red-50 text-red-700'
                    : turno.estado === 'COMPLETADO'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {turno.estado}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}