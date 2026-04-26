import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'

const adapter = new PrismaNeon({ connectionString: (process.env.DIRECT_URL ?? process.env.DATABASE_URL) as string })

const prisma = new PrismaClient({ adapter })
async function main() {
  console.log('Iniciando seed...')

  // 1. Crear la organización (la clínica)
  const org = await prisma.organization.upsert({
    where: { slug: 'clinica-demo' },
    update: {},
    create: {
      nombre: 'Clínica Demo',
      slug: 'clinica-demo',
      plan: 'BASIC',
    },
  })
  console.log(`✓ Organización: ${org.nombre}`)

  // 2. Crear usuario admin
  const adminHash = await bcrypt.hash('Admin123!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@clinica.com' },
    update: {},
    create: {
      email: 'admin@clinica.com',
      name: 'Administrador',
      passwordHash: adminHash,
      active: true,
    },
  })

  // Vincular admin a la organización
  await prisma.orgUser.upsert({
    where: { userId_orgId: { userId: admin.id, orgId: org.id } },
    update: {},
    create: {
      userId: admin.id,
      orgId: org.id,
      role: 'ADMIN',
    },
  })
  console.log(`✓ Admin: ${admin.email} / Admin123!`)

  // 3. Crear usuario médico
  const medicoHash = await bcrypt.hash('Medico123!', 12)
  const medico = await prisma.user.upsert({
    where: { email: 'medico@clinica.com' },
    update: {},
    create: {
      email: 'medico@clinica.com',
      name: 'Dr. Juan García',
      passwordHash: medicoHash,
      active: true,
    },
  })

  await prisma.orgUser.upsert({
    where: { userId_orgId: { userId: medico.id, orgId: org.id } },
    update: {},
    create: {
      userId: medico.id,
      orgId: org.id,
      role: 'MEDICO',
    },
  })
  console.log(`✓ Médico: ${medico.email} / Medico123!`)

  // 4. Crear usuario recepcionista
  const recepHash = await bcrypt.hash('Recep123!', 12)
  const recep = await prisma.user.upsert({
    where: { email: 'recepcion@clinica.com' },
    update: {},
    create: {
      email: 'recepcion@clinica.com',
      name: 'María López',
      passwordHash: recepHash,
      active: true,
    },
  })

  await prisma.orgUser.upsert({
    where: { userId_orgId: { userId: recep.id, orgId: org.id } },
    update: {},
    create: {
      userId: recep.id,
      orgId: org.id,
      role: 'RECEPCIONISTA',
    },
  })
  console.log(`✓ Recepcionista: ${recep.email} / Recep123!`)

  console.log('\n✅ Seed completado.')
  console.log('─────────────────────────────')
  console.log('Usuarios creados:')
  console.log('  admin@clinica.com     → Admin123!')
  console.log('  medico@clinica.com    → Medico123!')
  console.log('  recepcion@clinica.com → Recep123!')
}

main()
  .catch((e) => {
    console.error('Error en seed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())