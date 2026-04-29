import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  label: {
    fontSize: 9,
    color: '#64748b',
    width: 80,
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
    marginTop: 4,
  },
  indicacionesText: {
    fontSize: 9,
    color: '#78350f',
    lineHeight: 1.5,
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
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginVertical: 12,
  },
})

interface RecetaPDFProps {
  receta: any
  org: any
}

export function RecetaPDF({ receta, org }: RecetaPDFProps) {
  const paciente = receta.medicalRecord.patient
  const edad = paciente.fechaNacimiento
    ? Math.floor(
        (new Date().getTime() - new Date(paciente.fechaNacimiento).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.orgName}>{org?.nombre ?? 'Mi Clínica'}</Text>
            <Text style={styles.orgSub}>Sistema de Gestión Médica</Text>
          </View>
          <View>
            <Text style={styles.recetaTitle}>RECETA MÉDICA</Text>
            <Text style={styles.recetaNum}>#{receta.id.slice(0, 8).toUpperCase()}</Text>
            <Text style={styles.recetaTitle}>
              {format(new Date(receta.fecha), "d 'de' MMMM yyyy", { locale: es })}
            </Text>
          </View>
        </View>

        {/* Datos del paciente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del paciente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Apellido y nombre:</Text>
            <Text style={styles.value}>
              {paciente.apellido}, {paciente.nombre}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>DNI:</Text>
            <Text style={styles.value}>{paciente.dni}</Text>
            {edad !== null && (
              <>
                <Text style={styles.label}>Edad:</Text>
                <Text style={styles.value}>{edad} años</Text>
              </>
            )}
          </View>
          {paciente.obraSocial && (
            <View style={styles.row}>
              <Text style={styles.label}>Obra social:</Text>
              <Text style={styles.value}>{paciente.obraSocial}</Text>
              {paciente.numeroAfiliado && (
                <>
                  <Text style={styles.label}>N° afiliado:</Text>
                  <Text style={styles.value}>{paciente.numeroAfiliado}</Text>
                </>
              )}
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Medicamentos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medicamentos prescriptos</Text>
          {receta.items.map((item: any, index: number) => (
            <View key={index} style={styles.medicamentoBox}>
              <Text style={styles.medicamentoNombre}>{item.nombre}</Text>
              {item.dosis && (
                <Text style={styles.medicamentoDetail}>Dosis: {item.dosis}</Text>
              )}
              {item.frecuencia && (
                <Text style={styles.medicamentoDetail}>Frecuencia: {item.frecuencia}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Indicaciones */}
        {receta.indicaciones && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Indicaciones</Text>
            <View style={styles.indicacionesBox}>
              <Text style={styles.indicacionesText}>{receta.indicaciones}</Text>
            </View>
          </View>
        )}

        {/* Footer con firma */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerText}>
              Documento generado el{' '}
              {format(new Date(), "d/MM/yyyy 'a las' HH:mm", { locale: es })}
            </Text>
            <Text style={styles.footerText}>
              Este documento tiene validez como receta médica
            </Text>
          </View>
          <View style={styles.firmaBox}>
            <View style={styles.firmaLinea} />
            <Text style={styles.firmaNombre}>{receta.professional.name}</Text>
            <Text style={styles.firmaCargo}>Médico</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
