import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEmpanelledHospitals,
  getEmpanelledHospitalById,
  createEmpanelledHospital,
} from '@/api/sushrut/empanelledHospital.api';
import type { EmpanelledHospital } from '@/types';

export function useEmpanelledHospitals() {
  return useQuery<EmpanelledHospital[]>({
    queryKey: ['empanelled-hospitals'],
    queryFn: getEmpanelledHospitals,
  });
}

export function useEmpanelledHospital(id: string) {
  return useQuery<EmpanelledHospital>({
    queryKey: ['empanelled-hospital', id],
    queryFn: () => getEmpanelledHospitalById(id),
    enabled: !!id,
  });
}

export function useCreateEmpanelledHospital() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmpanelledHospital,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empanelled-hospitals'] });
    },
  });
}
