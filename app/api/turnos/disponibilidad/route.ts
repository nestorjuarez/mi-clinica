import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addMinutes, setHours, setMinutes } from 'date-fns'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const orgId = (session.user as any).orgId
  const { searchParams } = new URL(req.url)
  const professionalId = searchParams.get('professionalId')
  const fecha = searchParams.get('fecha')

  if (!professionalId || !fecha) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
  }

  const day = new Date(fecha)
  const inicio = new Date(day)
  inicio.setHours(0, 0, 0, 0)
  const fin = new Date(day)
  fin.setHours(23, 59, 59, 999)

  const turnosOcupados = await prisma.appointment.findMany({
    where: {
      orgId,
      professionalId,
      fechaHora: { gte: inicio, lte: fin },
      estado: { in: ['PENDIENTE', 'CONFIRMADO'] },
    },
    select: { fechaHora: true, duracionMin: true },
  })

  // Generar slots de 8:00 a 20:00 cada 30 minutos
  const slots: string[] = []
  let current = setMinutes(setHours(new Date(fecha), 8), 0)
  const end = setMinutes(setHours(new Date(fecha), 20), 0)

  while (current < end) {
    const slotISO = current.toISOString()
    const ocupado = turnosOcupados.some((t: { fechaHora: Date; duracionMin: number }) => {
      const tStart = new Date(t.fechaHora)
      const tEnd = addMinutes(tStart, t.duracionMin)
      return current >= tStart && current < tEnd
    })
    if (!ocupado) slots.push(slotISO)
    current = addMinutes(current, 30)
  }

  return NextResponse.json(slots)
}