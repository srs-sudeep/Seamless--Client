import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFacultyOPDClaims,
  getFacultyOPDClaimById,
  createFacultyOPDClaim,
  updateFacultyOPDClaim,
  deleteFacultyOPDClaim,
  approveFacultyOPDClaim,
  rejectFacultyOPDClaim,
} from '@/api/sushrut/facultyOPD.api';
import type { FacultyOPDClaim, UpdateFacultyOPDClaimPayload } from '@/types';

export function useFacultyOPDClaims() {
  return useQuery<FacultyOPDClaim[]>({
    queryKey: ['faculty-opd-claims'],
    queryFn: getFacultyOPDClaims,
  });
}

export function useFacultyOPDClaim(id: string) {
  return useQuery<FacultyOPDClaim>({
    queryKey: ['faculty-opd-claim', id],
    queryFn: () => getFacultyOPDClaimById(id),
    enabled: !!id,
  });
}

export function useCreateFacultyOPDClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFacultyOPDClaim,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty-opd-claims'] });
    },
  });
}

export function useUpdateFacultyOPDClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFacultyOPDClaimPayload }) =>
      updateFacultyOPDClaim(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty-opd-claims'] });
    },
  });
}

export function useDeleteFacultyOPDClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFacultyOPDClaim(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty-opd-claims'] });
    },
  });
}

export function useApproveFacultyOPDClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveFacultyOPDClaim(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty-opd-claims'] });
    },
  });
}

export function useRejectFacultyOPDClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rejectFacultyOPDClaim(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty-opd-claims'] });
    },
  });
}
