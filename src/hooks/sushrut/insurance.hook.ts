import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInsurances, getInsuranceById, createInsurance } from '@/api/sushrut/insurance.api';
import type { Insurance, CreateInsurancePayload } from '@/types';

export function useInsurances() {
  return useQuery<Insurance[]>({
    queryKey: ['insurances'],
    queryFn: getInsurances,
  });
}

export function useInsurance(id: string) {
  return useQuery<Insurance>({
    queryKey: ['insurance', id],
    queryFn: () => getInsuranceById(id),
    enabled: !!id,
  });
}

export function useCreateInsurance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInsurance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurances'] });
    },
  });
}
