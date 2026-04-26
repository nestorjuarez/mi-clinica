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

  const record = await prisma.medicalRecord.findFirst({
    where: { id: params.id, orgId },
    include: {
      patient: true,
      professional: { select: { name: true } },
      evolutions: {
        orderBy: { fecha: 'desc' },
        include: { professional: { select: { name: true } } },
      },
      prescriptions: {
        orderBy: { fecha: 'desc' },
        include: { professional: { select: { name: true } } },
      },
      studies: { orderBy: { fecha: 'desc' } },
      treatments: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!record) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  return NextResponse.json(record)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const orgId = (session.user as any).orgId
  const body = await req.json()

  const record = await prisma.medicalRecord.updateMany({
    where: { id: params.id, orgId },
    data: body,
  })

  return NextResponse.json(record)
}