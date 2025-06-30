import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudentVendors, createStudentVendor, deleteStudentVendor } from '@/api';
import type { StudentVendor } from '@/types';

export function useStudentVendors() {
  return useQuery<StudentVendor[]>({
    queryKey: ['student-vendors'],
    queryFn: getStudentVendors,
  });
}

export function useCreateStudentVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStudentVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-vendors'] });
    },
  });
}

export function useDeleteStudentVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ student_id, vendor_id }: { student_id: string; vendor_id: string }) =>
      deleteStudentVendor(student_id, vendor_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-vendors'] });
    },
  });
}
