import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudents, createStudent } from '@/api';
import type { Student } from '@/types';

export function useStudents() {
  return useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: getStudents,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}
