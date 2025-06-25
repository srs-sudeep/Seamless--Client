import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVendors, createVendor, updateVendor, deleteVendor } from '@/api/naivedyam/vendors.api';
import { Vendor } from '@/types';

export function useVendors() {
  return useQuery<Vendor[]>({
    queryKey: ['vendors'],
    queryFn: getVendors,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Vendor> }) =>
      updateVendor(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}
