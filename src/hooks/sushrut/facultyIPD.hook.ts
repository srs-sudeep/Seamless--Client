import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFacultyIPDClaims,
  getFacultyIPDClaimById,
  createFacultyIPDClaim,
  updateFacultyIPDClaim,
  deleteFacultyIPDClaim,
} from '@/api/sushrut/facultyIPD.api';
import type { FacultyIPDClaim, UpdateFacultyIPDPayload } from '@/types';

export function useFacultyIPDClaims() {
  return useQuery<FacultyIPDClaim[]>({
    queryKey: ['faculty-ipd-claims'],
    queryFn: getFacultyIPDClaims,
  });
}

export function useFacultyIPDClaim(id: string) {
  return useQuery<FacultyIPDClaim>({
    queryKey: ['faculty-ipd-claim', id],
    queryFn: () => getFacultyIPDClaimById(id),
    enabled: !!id,
  });
}

export function useCreateFacultyIPDClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFacultyIPDClaim,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty-ipd-claims'] });
    },
  });
}

export function useUpdateFacultyIPDClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFacultyIPDPayload }) =>
      updateFacultyIPDClaim(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty-ipd-claims'] });
    },
  });
}

export function useDeleteFacultyIPDClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFacultyIPDClaim(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty-ipd-claims'] });
    },
  });
}
