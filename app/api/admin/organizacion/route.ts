import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const orgId = (session.user as any).orgId
  const role = (session.user as any).role

  if (role !== 'ADMIN') return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
  })

  if (!org) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  return NextResponse.json(org)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const orgId = (session.user as any).orgId
  const role = (session.user as any).role

  if (role !== 'ADMIN') return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

  const body = await req.json()
  const { nombre, slug, plan } = body

  const org = await prisma.organization.update({
    where: { id: orgId },
    data: { nombre, slug, plan },
  })

  return NextResponse.json(org)
}
