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

  const study = await prisma.study.create({
    data: {
      medicalRecordId: params.id,
      orgId,
      professionalId,
      tipo: body.tipo,
      descripcion: body.descripcion,
      resultado: body.resultado,
      laboratorio: body.laboratorio,
      archivoUrl: body.archivoUrl,
    },
  })

  return NextResponse.json(study, { status: 201 })
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const orgId = (session.user as any).orgId

  const studies = await prisma.study.findMany({
    where: { medicalRecordId: params.id, orgId },
    orderBy: { fecha: 'desc' },
  })

  return NextResponse.json(studies)
}
