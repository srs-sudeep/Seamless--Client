import { apiClient } from '@/core';
import type { Instructor } from '@/types/bodhika/instructor.types';

export async function getInstructors(): Promise<Instructor[]> {
  const { data } = await apiClient.get<Instructor[]>('/bodhika/api/v1/courses/all-instructors');
  return data;
}

export async function createInstructor(payload: Omit<Instructor, 'is_deleted'>) {
  const { data } = await apiClient.post<Instructor>(
    '/bodhika/api/v1/courses/create-instruction-course',
    payload
  );
  return data;
}

export async function updateInstructor(instructor_ldap: string, payload: Partial<Instructor>) {
  const { data } = await apiClient.put<Instructor>(
    `/bodhika/api/v1/courses/update-instructor/${instructor_ldap}`,
    payload
  );
  return data;
}

export async function deleteInstructor(instructor_ldap: string) {
  await apiClient.delete(`/bodhika/api/v1/courses/delete-instructor/${instructor_ldap}`);
}
