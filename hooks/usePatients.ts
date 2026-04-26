import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Patient {
  id: string
  dni: string
  nombre: string
  apellido: string
  fechaNacimiento: string
  telefono?: string
  email?: string
  obraSocial?: string
  numeroAfiliado?: string
  antecedentes?: string
  alergias?: string
  medicacionActual?: string
}

interface PatientsResponse {
  data: Patient[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

async function fetchPatients(search = '', page = 1): Promise<PatientsResponse> {
  const params = new URLSearchParams({ q: search, page: String(page) })
  const res = await fetch(`/api/pacientes?${params}`)
  if (!res.ok) throw new Error('Error al cargar pacientes')
  return res.json()
}

async function fetchPatient(id: string): Promise<Patient> {
  const res = await fetch(`/api/pacientes/${id}`)
  if (!res.ok) throw new Error('Error al cargar paciente')
  return res.json()
}

export function usePatients(search = '', page = 1) {
  return useQuery({
    queryKey: ['patients', search, page],
    queryFn: () => fetchPatients(search, page),
    staleTime: 1000 * 60 * 2,
  })
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => fetchPatient(id),
    enabled: !!id,
  })
}

export function useCreatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Patient, 'id'>) => {
      const res = await fetch('/api/pacientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error ?? 'Error al crear paciente')
      }
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  })
}

export function useUpdatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Patient> }) => {
      const res = await fetch(`/api/pacientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Error al actualizar paciente')
      return res.json()
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['patients'] })
      qc.invalidateQueries({ queryKey: ['patient', id] })
    },
  })
}

export function useDeletePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/pacientes/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar paciente')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  })
}