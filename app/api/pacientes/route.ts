import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createPatientSchema = z.object({
  dni: z.string().min(7).max(11),
  nombre: z.string().min(2),
  apellido: z.string().min(2),
  fechaNacimiento: z.string(),
  telefono: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  obraSocial: z.string().optional(),
  numeroAfiliado: z.string().optional(),
  antecedentes: z.string().optional(),
  alergias: z.string().optional(),
  medicacionActual: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const orgId = (session.user as any).orgId
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('q') ?? ''
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '20')
  const skip = (page - 1) * limit

  const where: any = {
    orgId,
    // active: true,
  }

  if (search) {
    where.OR = [
      { dni: { contains: search } },
      { nombre: { contains: search, mode: 'insensitive' as const } },
      { apellido: { contains: search, mode: 'insensitive' as const } },
    ]
  }

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
      skip,
      take: limit,
      select: {
        id: true,
        dni: true,
        nombre: true,
        apellido: true,
        fechaNacimiento: true,
        telefono: true,
        obraSocial: true,
        email: true,
        createdAt: true,
      },
    }),
    prisma.patient.count({ where }),
  ])

  return NextResponse.json({
    data: patients,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const orgId = (session.user as any).orgId
  const body = await req.json()
  const parsed = createPatientSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const existing = await prisma.patient.findUnique({
    where: { orgId_dni: { orgId, dni: parsed.data.dni } },
  })
  if (existing) {
    return NextResponse.json(
      { error: 'Ya existe un paciente con ese DNI' },
      { status: 409 }
    )
  }

  const patient = await prisma.patient.create({
    data: {
      ...parsed.data,
      orgId,
      fechaNacimiento: new Date(parsed.data.fechaNacimiento),
    },
  })

  return NextResponse.json(patient, { status: 201 })
}