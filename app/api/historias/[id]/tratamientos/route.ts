import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const orgId = (session.user as any).orgId

  const treatments = await prisma.treatment.findMany({
    where: { medicalRecordId: params.id, orgId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(treatments)
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const orgId = (session.user as any).orgId
  const body = await req.json()

  const record = await prisma.medicalRecord.findFirst({
    where: { id: params.id, orgId },
  })
  if (!record) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const treatment = await prisma.treatment.create({
    data: {
      medicalRecordId: params.id,
      orgId,
      nombre: body.nombre,
      descripcion: body.descripcion,
      fechaInicio: new Date(body.fechaInicio),
      fechaFin: body.fechaFin ? new Date(body.fechaFin) : null,
      estado: body.estado ?? 'ACTIVO',
      observaciones: body.observaciones,
    },
  })

  return NextResponse.json(treatment, { status: 201 })
}
