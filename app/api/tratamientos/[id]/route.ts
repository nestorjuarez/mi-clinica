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

  const treatment = await prisma.treatment.findFirst({
    where: { id: params.id, orgId },
  })

  if (!treatment) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  return NextResponse.json(treatment)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const orgId = (session.user as any).orgId
  const body = await req.json()

  const treatment = await prisma.treatment.updateMany({
    where: { id: params.id, orgId },
    data: {
      nombre: body.nombre,
      descripcion: body.descripcion,
      fechaInicio: body.fechaInicio ? new Date(body.fechaInicio) : undefined,
      fechaFin: body.fechaFin ? new Date(body.fechaFin) : null,
      estado: body.estado,
      observaciones: body.observaciones,
    },
  })

  return NextResponse.json(treatment)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const orgId = (session.user as any).orgId

  await prisma.treatment.updateMany({
    where: { id: params.id, orgId },
    data: { estado: 'FINALIZADO' },
  })

  return NextResponse.json({ ok: true })
}
