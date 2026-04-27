import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const orgId = (session.user as any).orgId
  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role')

  const orgUsers = await prisma.orgUser.findMany({
    where: {
      orgId,
      ...(role && { role: role as any }),
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  return NextResponse.json(orgUsers.map((ou: any) => ({
    id: ou.user.id,
    name: ou.user.name,
    email: ou.user.email,
    role: ou.role,
  })))
}