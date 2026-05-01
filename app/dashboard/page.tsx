import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { format, isToday, isTomorrow } from 'date-fns'
import { es } from 'date-fns/locale'

const ESTADO_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  PENDIENTE:  { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400' },
  CONFIRMADO: { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-400' },
  CANCELADO:  { bg: 'bg-red-50',    text: 'text-red-600',    dot: 'bg-red-400' },
  COMPLETADO: { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-400' },
  AUSENTE:    { bg: 'bg-slate-100', text: 'text-slate-500',  dot: 'bg-slate-400' },
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const orgId = (session?.user as any)?.orgId
  const role = (session?.user as any)?.role

  const hoy = new Date()
  const inicioHoy = new Date(hoy); inicioHoy.setHours(0, 0, 0, 0)
  const finHoy = new Date(hoy); finHoy.setHours(23, 59, 59, 999)

  const inicioPróximo = new Date(hoy)
  const finPróximo = new Date(hoy)
  finPróximo.setDate(finPróximo.getDate() + 7)

  const [
    totalPacientes,
    turnosHoy,
    turnosPendientes,
    turnosProximos,
    ultimosPacientes,
  ] = await Promise.all([
    prisma.patient.count({ where: { orgId, active: true } }),
    prisma.appointment.count({
      where: { orgId, fechaHora: { gte: inicioHoy, lte: finHoy } },
    }),
    prisma.appointment.count({
      where: { orgId, estado: 'PENDIENTE' },
    }),
    prisma.appointment.findMany({
      where: {
        orgId,
        fechaHora: { gte: inicioHoy, lte: finPróximo },
        estado: { in: ['PENDIENTE', 'CONFIRMADO'] },
      },
      include: {
        patient: { select: { nombre: true, apellido: true } },
        professional: { select: { name: true } },
      },
      orderBy: { fechaHora: 'asc' },
      take: 8,
    }),
    prisma.patient.findMany({
      where: { orgId, active: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, nombre: true, apellido: true, obraSocial: true, createdAt: true },
    }),
  ])

  const nombre = session?.user?.name?.split(' ')[0]
  const horaActual = hoy.getHours()
  const saludo = horaActual < 12 ? 'Buenos días' : horaActual < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          {saludo}, {nombre}
        </h1>
        <p className="text-slate-400 text-sm mt-1 capitalize">
          {format(hoy, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link href="/dashboard/pacientes" className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-blue-200 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-500">Total Pacientes</p>
            <div className="w-9 h-9 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalPacientes}</p>
          <p className="text-xs text-slate-400 mt-1">pacientes activos</p>
        </Link>

        <Link href="/dashboard/agenda" className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-green-200 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-500">Turnos Hoy</p>
            <div className="w-9 h-9 bg-green-50 group-hover:bg-green-100 rounded-xl flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{turnosHoy}</p>
          <p className="text-xs text-slate-400 mt-1">programados para hoy</p>
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-500">Sin confirmar</p>
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{turnosPendientes}</p>
          <p className="text-xs text-slate-400 mt-1">turnos por confirmar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximos turnos */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Próximos turnos</h2>
            <Link href="/dashboard/agenda" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Ver agenda →
            </Link>
          </div>

          {turnosProximos.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-slate-400 text-sm">No hay turnos próximos</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {turnosProximos.map((turno: any) => {
                const fecha = new Date(turno.fechaHora)
                const esHoy = isToday(fecha)
                const esMañana = isTomorrow(fecha)
                const colors = ESTADO_COLORS[turno.estado] ?? ESTADO_COLORS.PENDIENTE
                return (
                  <div key={turno.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="text-center w-12 shrink-0">
                      <p className="text-xs font-semibold text-slate-400">
                        {esHoy ? 'HOY' : esMañana ? 'MAÑ' : format(fecha, 'EEE', { locale: es }).toUpperCase()}
                      </p>
                      <p className="text-lg font-bold text-slate-900 leading-tight">{format(fecha, 'HH:mm')}</p>
                    </div>
                    <div className={`w-1.5 h-8 rounded-full shrink-0 ${colors.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {turno.patient.apellido}, {turno.patient.nombre}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{turno.professional.name}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${colors.bg} ${colors.text}`}>
                      {turno.estado}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Últimos pacientes + accesos rápidos */}
        <div className="space-y-4">
          {/* Accesos rápidos */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Accesos rápidos</h2>
            <div className="space-y-2">
              <Link href="/dashboard/pacientes/nuevo"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-slate-700">Nuevo paciente</span>
              </Link>
              <Link href="/dashboard/agenda"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-colors group">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-slate-700">Nuevo turno</span>
              </Link>
              {(role === 'ADMIN' || role === 'MEDICO') && (
                <Link href="/dashboard/historias"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-colors group">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-slate-700">Historias clínicas</span>
                </Link>
              )}
            </div>
          </div>

          {/* Últimos pacientes */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Últimos pacientes</h2>
              <Link href="/dashboard/pacientes" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                Ver todos →
              </Link>
            </div>
            {ultimosPacientes.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-slate-400 text-sm">No hay pacientes</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {ultimosPacientes.map((p) => (
                  <Link key={p.id} href={`/dashboard/pacientes/${p.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-slate-500">
                        {p.apellido.charAt(0)}{p.nombre.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {p.apellido}, {p.nombre}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{p.obraSocial ?? 'Sin obra social'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
