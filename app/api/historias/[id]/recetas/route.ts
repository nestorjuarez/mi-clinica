import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const orgId = (session.user as any).orgId
  const professionalId = (session.user as any).id
  const body = await req.json()

  const record = await prisma.medicalRecord.findFirst({
    where: { id: params.id, orgId },
  })
  if (!record) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const prescription = await prisma.prescription.create({
    data: {
      medicalRecordId: params.id,
      orgId,
      professionalId,
      indicaciones: body.indicaciones,
      estado: 'ACTIVA',
      items: {
        create: body.items.map((item: any) => ({
          nombre: item.nombre,
          dosis: item.dosis,
          frecuencia: item.frecuencia,
        })),
      },
    },
    include: {
      items: true,
      professional: { select: { name: true } },
    },
  })

  return NextResponse.json(prescription, { status: 201 })
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const orgId = (session.user as any).orgId

  const prescriptions = await prisma.prescription.findMany({
    where: { medicalRecordId: params.id, orgId },
    orderBy: { fecha: 'desc' },
    include: {
      items: true,
      professional: { select: { name: true } },
    },
  })

  return NextResponse.json(prescriptions)
}