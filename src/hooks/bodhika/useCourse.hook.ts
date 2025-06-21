import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getMyInstructorCourses,
  getMyStudentCourses,
} from '@/api';
import type { Course } from '@/types';

export function useCourses() {
  return useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: getCourses,
  });
}

export function useMyInstructorCourses() {
  return useQuery<Course[]>({
    queryKey: ['myInstructorCourses'],
    queryFn: getMyInstructorCourses,
  });
}

export function useMyStudentCourses() {
  return useQuery<Course[]>({
    queryKey: ['myStudentCourses'],
    queryFn: getMyStudentCourses,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ course_id, payload }: { course_id: string; payload: any }) =>
      updateCourse(course_id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (course_id: string) => deleteCourse(course_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}
