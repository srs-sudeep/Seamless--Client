import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDoctorSlots,
  getAppointmentsByDoctor,
  createAppointment,
} from '@/api/sushrut/appointment.api';
import type { DoctorSlots, ExistingAppointment } from '@/types/sushrut/appointment.types';

export function useDoctorSlots(ldapid: string) {
  return useQuery<DoctorSlots>({
    queryKey: ['doctor-slots', ldapid],
    queryFn: () => getDoctorSlots(ldapid),
    enabled: !!ldapid,
  });
}

export function useAppointmentsByDoctor(ldapid: string) {
  return useQuery<ExistingAppointment[]>({
    queryKey: ['appointments-by-doctor', ldapid],
    queryFn: () => getAppointmentsByDoctor(ldapid),
    enabled: !!ldapid,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-slots'] });
      queryClient.invalidateQueries({ queryKey: ['appointments-by-doctor'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}
