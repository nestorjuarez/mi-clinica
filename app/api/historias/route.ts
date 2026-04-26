import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const orgId = (session.user as any).orgId
  const professionalId = (session.user as any).id
  const body = await req.json()

  const { patientId, motivoConsulta, diagnostico, tratamiento, observaciones } = body

  if (!patientId) {
    return NextResponse.json({ error: 'Falta el paciente' }, { status: 400 })
  }

  // Verificar que no tenga ya una HC
  const existing = await prisma.medicalRecord.findFirst({
    where: { patientId, orgId },
  })
  if (existing) {
    return NextResponse.json(
      { error: 'El paciente ya tiene una historia clínica' },
      { status: 409 }
    )
  }

  const record = await prisma.medicalRecord.create({
    data: {
      patientId,
      orgId,
      professionalId,
      motivoConsulta,
      diagnostico,
      tratamiento,
      observaciones,
    },
  })

  return NextResponse.json(record, { status: 201 })
}