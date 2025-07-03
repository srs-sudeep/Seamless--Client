import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getStudentReimbursements,
  getStudentReimbursementById,
  createStudentReimbursement,
  updateStudentReimbursement,
  deleteStudentReimbursement,
  approveReimbursement,
  rejectReimbursement,
} from '@/api/sushrut/studentReimbursement.api';
import type {
  StudentReimbursement,
  CreateStudentReimbursementPayload,
  UpdateStudentReimbursementPayload,
} from '@/types';

export function useStudentReimbursements() {
  return useQuery<StudentReimbursement[]>({
    queryKey: ['student-reimbursements'],
    queryFn: getStudentReimbursements,
  });
}

export function useStudentReimbursement(id: string) {
  return useQuery<StudentReimbursement>({
    queryKey: ['student-reimbursement', id],
    queryFn: () => getStudentReimbursementById(id),
    enabled: !!id,
  });
}

export function useCreateStudentReimbursement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStudentReimbursement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-reimbursements'] });
    },
  });
}

export function useUpdateStudentReimbursement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStudentReimbursementPayload }) =>
      updateStudentReimbursement(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-reimbursements'] });
    },
  });
}

export function useDeleteStudentReimbursement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStudentReimbursement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-reimbursements'] });
    },
  });
}

export function useApproveReimbursement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveReimbursement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-reimbursements'] });
    },
  });
}

export function useRejectReimbursement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rejectReimbursement(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-reimbursements'] });
    },
  });
}
