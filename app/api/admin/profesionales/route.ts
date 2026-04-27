import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const orgId = (session.user as any).orgId
  const role = (session.user as any).role

  if (role !== 'ADMIN') return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

  const orgUsers = await prisma.orgUser.findMany({
    where: { orgId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          active: true,
          createdAt: true,
        },
      },
    },
    orderBy: { user: { name: 'asc' } },
  })

  return NextResponse.json(orgUsers.map((ou: any) => ({
    id: ou.user.id,
    name: ou.user.name,
    email: ou.user.email,
    active: ou.user.active,
    role: ou.role,
    createdAt: ou.user.createdAt,
  })))
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const orgId = (session.user as any).orgId
  const role = (session.user as any).role

  if (role !== 'ADMIN') return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

  const body = await req.json()
  const { name, email, password, userRole } = body

  if (!name || !email || !password || !userRole) {
    return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: { name, email, passwordHash, active: true },
  })

  await prisma.orgUser.create({
    data: { userId: user.id, orgId, role: userRole },
  })

  return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 })
}
