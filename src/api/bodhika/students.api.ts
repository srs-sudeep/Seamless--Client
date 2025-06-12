import { apiClient } from '@/core';
import type { Student } from '@/types/bodhika/students.types';

export async function getStudents(): Promise<Student[]> {
  const { data } = await apiClient.get<Student[]>('/bodhika/api/v1/courses/all-students');
  return data;
}

export async function createStudent(payload: Student) {
  const { data } = await apiClient.post<Student>(
    '/bodhika/api/v1/courses/create-student-course',
    payload
  );
  return data;
}
