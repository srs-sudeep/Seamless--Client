import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFacultyIPDClaims,
  getFacultyIPDClaimById,
  createFacultyIPDClaim,
  updateFacultyIPDClaim,
  deleteFacultyIPDClaim,
  approveFacultyIPDClaim,
  rejectFacultyIPDClaim,
  submitForReview,
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

export function useApproveFacultyIPDClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveFacultyIPDClaim(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty-ipd-claims'] });
    },
  });
}

export function useRejectFacultyIPDClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rejectFacultyIPDClaim(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty-ipd-claims'] });
    },
  });
}

export function useSubmitForReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => submitForReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty-ipd-claims'] });
    },
  });
}
