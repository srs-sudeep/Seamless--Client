import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInsuranceHospitals,
  getInsuranceHospitalById,
  createInsuranceHospital,
} from '@/api/sushrut/insuranceHospital.api';
import type { InsuranceHospital, CreateInsuranceHospitalPayload } from '@/types';

export function useInsuranceHospitals() {
  return useQuery<InsuranceHospital[]>({
    queryKey: ['insurance-hospitals'],
    queryFn: getInsuranceHospitals,
  });
}

export function useInsuranceHospital(id: string) {
  return useQuery<InsuranceHospital>({
    queryKey: ['insurance-hospital', id],
    queryFn: () => getInsuranceHospitalById(id),
    enabled: !!id,
  });
}

export function useCreateInsuranceHospital() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInsuranceHospital,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance-hospitals'] });
    },
  });
}
