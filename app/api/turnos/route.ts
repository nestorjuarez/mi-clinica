import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  fechaHora: z.string(),
  duracionMin: z.number().default(30),
  motivoConsulta: z.string().optional(),
  observaciones: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const orgId = (session.user as any).orgId
  const { searchParams } = new URL(req.url)
  const fecha = searchParams.get('fecha')
  const professionalId = searchParams.get('professionalId')
  const estado = searchParams.get('estado')

  const where: any = { orgId }

  if (fecha) {
    const day = new Date(fecha)
    where.fechaHora = {
      gte: new Date(day.setHours(0, 0, 0, 0)),
      lte: new Date(day.setHours(23, 59, 59, 999)),
    }
  }

  if (professionalId) where.professionalId = professionalId
  if (estado) where.estado = estado

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: {
        select: { id: true, nombre: true, apellido: true, dni: true, telefono: true },
      },
      professional: {
        select: { id: true, name: true },
      },
    },
    orderBy: { fechaHora: 'asc' },
  })

  return NextResponse.json(appointments)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const orgId = (session.user as any).orgId
  const body = await req.json()
  const parsed = createAppointmentSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const fechaHora = new Date(parsed.data.fechaHora)

  // Verificar conflicto
  const conflicto = await prisma.appointment.findFirst({
    where: {
      orgId,
      professionalId: parsed.data.professionalId,
      fechaHora,
      estado: { in: ['PENDIENTE', 'CONFIRMADO'] },
    },
  })

  if (conflicto) {
    return NextResponse.json(
      { error: 'El profesional ya tiene un turno en ese horario' },
      { status: 409 }
    )
  }

  const appointment = await prisma.appointment.create({
    data: {
      ...parsed.data,
      fechaHora,
      orgId,
    },
    include: {
      patient: { select: { nombre: true, apellido: true } },
      professional: { select: { name: true } },
    },
  })

  return NextResponse.json(appointment, { status: 201 })
}