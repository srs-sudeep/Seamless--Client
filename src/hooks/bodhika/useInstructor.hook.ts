import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInstructors,
  createInstructor,
  updateInstructor,
  deleteInstructor,
} from '@/api/bodhika/instructor.api';
import type { Instructor } from '@/types/bodhika/instructor.types';

export function useInstructors() {
  return useQuery<Instructor[]>({
    queryKey: ['instructors'],
    queryFn: getInstructors,
  });
}

export function useCreateInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInstructor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
    },
  });
}

export function useUpdateInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ instructor_ldap, payload }: { instructor_ldap: string; payload: any }) =>
      updateInstructor(instructor_ldap, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
    },
  });
}

export function useDeleteInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (instructor_ldap: string) => deleteInstructor(instructor_ldap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
    },
  });
}
