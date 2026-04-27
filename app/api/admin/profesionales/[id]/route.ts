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

  const role = (session.user as any).role
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

  const body = await req.json()

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { active: body.active },
  })

  return NextResponse.json({ id: user.id, active: user.active })
}
