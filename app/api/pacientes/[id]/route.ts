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

  const patient = await prisma.patient.findFirst({
    where: { id: params.id, orgId },
  })

  if (!patient) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  return NextResponse.json(patient)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const orgId = (session.user as any).orgId
  const body = await req.json()

  const patient = await prisma.patient.updateMany({
    where: { id: params.id, orgId },
    data: body,
  })

  return NextResponse.json(patient)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const orgId = (session.user as any).orgId

  await prisma.patient.updateMany({
    where: { id: params.id, orgId },
    data: { active: false },
  })

  return NextResponse.json({ ok: true })
}