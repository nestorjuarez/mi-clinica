import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { renderToBuffer } from '@react-pdf/renderer'
import { RecetaPDF } from '@/components/pdf/RecetaPDF'
import React from 'react'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const orgId = (session.user as any).orgId

  const receta = await prisma.prescription.findFirst({
    where: { id: params.id, orgId },
    include: {
      items: true,
      professional: { select: { name: true, email: true } },
      medicalRecord: {
        include: {
          patient: {
            select: {
              nombre: true,
              apellido: true,
              dni: true,
              fechaNacimiento: true,
              obraSocial: true,
              numeroAfiliado: true,
            },
          },
        },
      },
    },
  })

  if (!receta) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
  })

  const buffer = await renderToBuffer(
    React.createElement(RecetaPDF, { receta, org })
  )

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="receta-${receta.id.slice(0, 8)}.pdf"`,
    },
  })
}
