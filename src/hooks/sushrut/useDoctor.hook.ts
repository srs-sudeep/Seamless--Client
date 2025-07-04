import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  getSlots,
  assignDoctorSlots,
} from '@/api/sushrut/doctor.api';
import type { Doctor, Slot } from '@/types/sushrut/doctor.types';

export function useDoctors() {
  return useQuery<Doctor[]>({
    queryKey: ['doctors'],
    queryFn: getDoctors,
  });
}

export function useDoctor(id: string) {
  return useQuery<Doctor>({
    queryKey: ['doctor', id],
    queryFn: () => getDoctorById(id),
    enabled: !!id,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });
}

export function useSlots() {
  return useQuery<Slot[]>({
    queryKey: ['slots'],
    queryFn: getSlots,
  });
}

export function useAssignDoctorSlots() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignDoctorSlots,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });
}
