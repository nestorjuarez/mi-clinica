import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import React from 'react'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  orgName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  orgSub: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
  },
  recetaTitle: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'right',
  },
  recetaNum: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    textAlign: 'right',
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#94a3b8',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontSize: 9,
    color: '#64748b',
    width: 100,
  },
  value: {
    fontSize: 9,
    color: '#1e293b',
    flex: 1,
  },
  medicamentoBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  medicamentoNombre: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  medicamentoDetail: {
    fontSize: 9,
    color: '#475569',
  },
  indicacionesBox: {
    backgroundColor: '#fffbeb',
    borderRadius: 4,
    padding: 10,
  },
  indicacionesText: {
    fontSize: 9,
    color: '#78350f',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginVertical: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
  firmaBox: {
    alignItems: 'center',
  },
  firmaLinea: {
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    width: 140,
    marginBottom: 4,
  },
  firmaNombre: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  firmaCargo: {
    fontSize: 8,
    color: '#64748b',
  },
})

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
      professional: { select: { name: true } },
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

  const org = await prisma.organization.findUnique({ where: { id: orgId } })

  const paciente = receta.medicalRecord.patient
  const edad = paciente.fechaNacimiento
    ? Math.floor(
        (Date.now() - new Date(paciente.fechaNacimiento).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null

  const doc = React.createElement(
    Document,
    {},
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      // Header
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(
          View,
          {},
          React.createElement(Text, { style: styles.orgName }, org?.nombre ?? 'Mi Clínica'),
          React.createElement(Text, { style: styles.orgSub }, 'Sistema de Gestión Médica')
        ),
        React.createElement(
          View,
          {},
          React.createElement(Text, { style: styles.recetaTitle }, 'RECETA MÉDICA'),
          React.createElement(Text, { style: styles.recetaNum }, `#${receta.id.slice(0, 8).toUpperCase()}`),
          React.createElement(
            Text,
            { style: styles.recetaTitle },
            format(new Date(receta.fecha), "d 'de' MMMM yyyy", { locale: es })
          )
        )
      ),
      // Paciente
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'DATOS DEL PACIENTE'),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'Apellido y nombre:'),
          React.createElement(Text, { style: styles.value }, `${paciente.apellido}, ${paciente.nombre}`)
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(Text, { style: styles.label }, 'DNI:'),
          React.createElement(Text, { style: styles.value }, `${paciente.dni}${edad ? `   Edad: ${edad} años` : ''}`)
        ),
        paciente.obraSocial
          ? React.createElement(
              View,
              { style: styles.row },
              React.createElement(Text, { style: styles.label }, 'Obra social:'),
              React.createElement(
                Text,
                { style: styles.value },
                `${paciente.obraSocial}${paciente.numeroAfiliado ? `   N° ${paciente.numeroAfiliado}` : ''}`
              )
            )
          : null
      ),
      React.createElement(View, { style: styles.divider }),
      // Medicamentos
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'MEDICAMENTOS PRESCRIPTOS'),
        ...receta.items.map((item: any) =>
          React.createElement(
            View,
            { style: styles.medicamentoBox, key: item.id },
            React.createElement(Text, { style: styles.medicamentoNombre }, item.nombre),
            item.dosis ? React.createElement(Text, { style: styles.medicamentoDetail }, `Dosis: ${item.dosis}`) : null,
            item.frecuencia ? React.createElement(Text, { style: styles.medicamentoDetail }, `Frecuencia: ${item.frecuencia}`) : null
          )
        )
      ),
      // Indicaciones
      receta.indicaciones
        ? React.createElement(
            View,
            { style: styles.section },
            React.createElement(Text, { style: styles.sectionTitle }, 'INDICACIONES'),
            React.createElement(
              View,
              { style: styles.indicacionesBox },
              React.createElement(Text, { style: styles.indicacionesText }, receta.indicaciones)
            )
          )
        : null,
      // Footer
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(
          View,
          {},
          React.createElement(
            Text,
            { style: styles.footerText },
            `Generado el ${format(new Date(), "d/MM/yyyy 'a las' HH:mm", { locale: es })}`
          ),
          React.createElement(
            Text,
            { style: styles.footerText },
            'Documento con validez como receta médica'
          )
        ),
        React.createElement(
          View,
          { style: styles.firmaBox },
          React.createElement(View, { style: styles.firmaLinea }),
          React.createElement(Text, { style: styles.firmaNombre }, receta.professional.name),
          React.createElement(Text, { style: styles.firmaCargo }, 'Médico')
        )
      )
    )
  )

  const buffer = await renderToBuffer(doc as any)

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="receta-${receta.id.slice(0, 8)}.pdf"`,
    },
  })
}
