import { apiClient } from '@/core';
import type {
  Instructor,
  GetInstructorsParams,
  InstructorListResponse,
  InstructorFiltersResponse,
} from '@/types';

export async function getInstructors(
  params: GetInstructorsParams = {}
): Promise<InstructorListResponse> {
  const { search, course_code, sem, instruction_type, page = 1, page_size = 10 } = params;
  const query: Record<string, any> = { page, page_size };
  if (search) query.search = search;
  if (course_code) query.course_code = course_code;
  if (sem) query.sem = sem;
  if (instruction_type) query.instruction_type = instruction_type;

  const { data } = await apiClient.get<InstructorListResponse>(
    '/bodhika/api/v1/courses/all-instructors',
    { params: query }
  );
  return data;
}

export async function getInstructorFilters(): Promise<InstructorFiltersResponse> {
  const { data } = await apiClient.get<InstructorFiltersResponse>(
    '/bodhika/api/v1/courses/instructor-filters'
  );
  return data;
}

export async function createInstructor(
  payload: Omit<Instructor, 'is_deleted'>
): Promise<Instructor> {
  const { data } = await apiClient.post<Instructor>(
    '/bodhika/api/v1/courses/create-instruction-course',
    payload
  );
  return data;
}

export async function updateInstructor(
  instructor_ldap: string,
  payload: Partial<Instructor>
): Promise<Instructor> {
  const { data } = await apiClient.put<Instructor>(
    `/bodhika/api/v1/courses/update-instructor/${instructor_ldap}`,
    payload
  );
  return data;
}

export async function deleteInstructor(instructor_ldap: string): Promise<void> {
  await apiClient.delete(`/bodhika/api/v1/courses/delete-instructor/${instructor_ldap}`);
}

export async function fetchCourseData(course_id: string) {
  const { data } = await apiClient.get(
    `/bodhika/api/v1/sessions/consolidated-attendance/${course_id}`
  );
  return data;
}
