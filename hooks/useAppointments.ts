import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Appointment {
  id: string
  patientId: string
  professionalId: string
  fechaHora: string
  duracionMin: number
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO' | 'COMPLETADO' | 'AUSENTE'
  motivoConsulta?: string
  observaciones?: string
  patient: { id: string; nombre: string; apellido: string; dni: string; telefono?: string }
  professional: { id: string; name: string }
}

async function fetchAppointments(params: {
  fecha?: string
  professionalId?: string
  estado?: string
}): Promise<Appointment[]> {
  const p = new URLSearchParams()
  if (params.fecha) p.set('fecha', params.fecha)
  if (params.professionalId) p.set('professionalId', params.professionalId)
  if (params.estado) p.set('estado', params.estado)
  const res = await fetch(`/api/turnos?${p}`)
  if (!res.ok) throw new Error('Error al cargar turnos')
  return res.json()
}

async function fetchDisponibilidad(professionalId: string, fecha: string): Promise<string[]> {
  const p = new URLSearchParams({ professionalId, fecha })
  const res = await fetch(`/api/turnos/disponibilidad?${p}`)
  if (!res.ok) throw new Error('Error al cargar disponibilidad')
  return res.json()
}

export function useAppointments(params: {
  fecha?: string
  professionalId?: string
  estado?: string
}) {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: () => fetchAppointments(params),
    staleTime: 1000 * 60,
  })
}

export function useDisponibilidad(professionalId: string, fecha: string) {
  return useQuery({
    queryKey: ['disponibilidad', professionalId, fecha],
    queryFn: () => fetchDisponibilidad(professionalId, fecha),
    enabled: !!professionalId && !!fecha,
    staleTime: 1000 * 60,
  })
}

export function useCreateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      patientId: string
      professionalId: string
      fechaHora: string
      duracionMin?: number
      motivoConsulta?: string
      observaciones?: string
    }) => {
      const res = await fetch('/api/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error ?? 'Error al crear turno')
      }
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}

export function useUpdateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Appointment> }) => {
      const res = await fetch(`/api/turnos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Error al actualizar turno')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}

export function useCancelAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/turnos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al cancelar turno')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}