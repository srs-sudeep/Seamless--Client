import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInstructors,
  createInstructor,
  updateInstructor,
  deleteInstructor,
  getInstructorFilters,
  fetchCourseData,
} from '@/api';
import type {
  GetInstructorsParams,
  InstructorListResponse,
  InstructorFiltersResponse,
} from '@/types';

export function useInstructors(params: GetInstructorsParams = {}) {
  return useQuery<InstructorListResponse>({
    queryKey: ['instructors', params],
    queryFn: () => getInstructors(params),
  });
}

export function useInstructorFilters() {
  return useQuery<InstructorFiltersResponse>({
    queryKey: ['instructor-filters'],
    queryFn: getInstructorFilters,
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

export function useDownloadCSV(course_id: string) {
  return useQuery<any>({
    queryKey: ['csvData', course_id],
    queryFn: () => fetchCourseData(course_id),
    enabled: !!course_id,
  });
}
