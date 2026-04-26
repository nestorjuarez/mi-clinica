'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

const TABS = [
  { id: 'historia', label: 'Historia clínica' },
  { id: 'evoluciones', label: 'Evoluciones' },
  { id: 'recetas', label: 'Recetas' },
  { id: 'estudios', label: 'Estudios' },
  { id: 'turnos', label: 'Turnos' },
]

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-amber-50 text-amber-700',
  CONFIRMADO: 'bg-green-50 text-green-700',
  CANCELADO: 'bg-red-50 text-red-700',
  COMPLETADO: 'bg-blue-50 text-blue-700',
  AUSENTE: 'bg-slate-50 text-slate-500',
}

interface PatientTabsProps {
  patient: any
  medicalRecord: any
}

export default function PatientTabs({ patient, medicalRecord }: PatientTabsProps) {
  const [activeTab, setActiveTab] = useState('historia')

  return (
    <div>
      <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-xl">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'historia' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          {!medicalRecord ? (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm mb-4">No hay historia clínica registrada</p>
              <Link
                href={`/dashboard/historias/nueva?patientId=${patient.id}`}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Crear historia clínica
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Historia clínica</h3>
                <span className="text-xs text-slate-400">
                  Abierta el {format(new Date(medicalRecord.fechaApertura), 'd/MM/yyyy', { locale: es })}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {medicalRecord.motivoConsulta && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Motivo de consulta</p>
                    <p className="text-sm text-slate-700">{medicalRecord.motivoConsulta}</p>
                  </div>
                )}
                {medicalRecord.diagnostico && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Diagnóstico</p>
                    <p className="text-sm text-slate-700">{medicalRecord.diagnostico}</p>
                  </div>
                )}
                {medicalRecord.tratamiento && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Tratamiento</p>
                    <p className="text-sm text-slate-700">{medicalRecord.tratamiento}</p>
                  </div>
                )}
                {patient.antecedentes && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Antecedentes</p>
                    <p className="text-sm text-slate-700">{patient.antecedentes}</p>
                  </div>
                )}
              </div>
              {medicalRecord.treatments && medicalRecord.treatments.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Tratamientos activos</p>
                  <div className="space-y-2">
                    {medicalRecord.treatments.map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{t.nombre}</p>
                          {t.descripcion && (
                            <p className="text-xs text-slate-500">{t.descripcion}</p>
                          )}
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          {t.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'evoluciones' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Evoluciones</h3>
            {medicalRecord && (
              <Link
                href={`/dashboard/historias/${medicalRecord.id}/evoluciones/nueva`}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                + Nueva evolución
              </Link>
            )}
          </div>
          {!medicalRecord || !medicalRecord.evolutions || medicalRecord.evolutions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-400 text-sm">No hay evoluciones registradas</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {medicalRecord.evolutions.map((ev: any) => (
                <div key={ev.id} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500">
                      {format(new Date(ev.fecha), "d 'de' MMMM yyyy", { locale: es })}
                    </span>
                    <span className="text-xs text-slate-400">{ev.professional && ev.professional.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {ev.subjetivo && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs font-semibold text-slate-500 mb-1">S — Subjetivo</p>
                        <p className="text-sm text-slate-700">{ev.subjetivo}</p>
                      </div>
                    )}
                    {ev.objetivo && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs font-semibold text-slate-500 mb-1">O — Objetivo</p>
                        <p className="text-sm text-slate-700">{ev.objetivo}</p>
                      </div>
                    )}
                    {ev.evaluacion && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs font-semibold text-slate-500 mb-1">A — Evaluación</p>
                        <p className="text-sm text-slate-700">{ev.evaluacion}</p>
                      </div>
                    )}
                    {ev.plan && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs font-semibold text-slate-500 mb-1">P — Plan</p>
                        <p className="text-sm text-slate-700">{ev.plan}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'recetas' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Recetas</h3>
            {medicalRecord && (
              <Link
                href={`/dashboard/recetas/nueva?medicalRecordId=${medicalRecord.id}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                + Nueva receta
              </Link>
            )}
          </div>
          {!medicalRecord || !medicalRecord.prescriptions || medicalRecord.prescriptions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-400 text-sm">No hay recetas registradas</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {medicalRecord.prescriptions.map((rx: any) => (
                <div key={rx.id} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500">
                      {format(new Date(rx.fecha), 'd/MM/yyyy', { locale: es })}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      rx.estado === 'ACTIVA' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {rx.estado}
                    </span>
                  </div>
                  {rx.indicaciones && (
                    <p className="text-sm text-slate-700">{rx.indicaciones}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">{rx.professional && rx.professional.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'estudios' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Estudios</h3>
          </div>
          {!medicalRecord || !medicalRecord.studies || medicalRecord.studies.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-400 text-sm">No hay estudios registrados</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {medicalRecord.studies.map((st: any) => (
                <div key={st.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{st.descripcion}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {st.tipo} · {format(new Date(st.fecha), 'd/MM/yyyy', { locale: es })}
                      {st.laboratorio && ` · ${st.laboratorio}`}
                    </p>
                    {st.resultado && (
                      <p className="text-xs text-slate-600 mt-1">{st.resultado}</p>
                    )}
                  </div>
                  {st.archivoUrl && (
                    <a
                      href={st.archivoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Ver archivo
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'turnos' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Historial de turnos</h3>
          </div>
          {!patient.appointments || patient.appointments.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-400 text-sm">No hay turnos registrados</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {patient.appointments.map((ap: any) => (
                <div key={ap.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {format(new Date(ap.fechaHora), "d 'de' MMMM yyyy · HH:mm", { locale: es })}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{ap.professional && ap.professional.name}</p>
                    {ap.motivoConsulta && (
                      <p className="text-xs text-slate-500 mt-0.5">{ap.motivoConsulta}</p>
                    )}
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ESTADO_COLORS[ap.estado]}`}>
                    {ap.estado}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
