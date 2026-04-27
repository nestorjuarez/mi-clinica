import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const orgId = (session.user as any).orgId
  const body = await req.json()

  const appointment = await prisma.appointment.updateMany({
    where: { id: params.id, orgId },
    data: body,
  })

  return NextResponse.json(appointment)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const orgId = (session.user as any).orgId

  await prisma.appointment.updateMany({
    where: { id: params.id, orgId },
    data: { estado: 'CANCELADO' },
  })

  return NextResponse.json({ ok: true })
}
