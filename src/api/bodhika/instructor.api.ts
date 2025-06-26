import { apiClient, BODHIKA_URL } from '@/core';
import type {
  GetInstructorsParams,
  Instructor,
  InstructorFiltersResponse,
  InstructorListResponse,
} from '@/types';

const BASE = `${BODHIKA_URL}/courses/`;

export async function getInstructors(
  params: GetInstructorsParams = {}
): Promise<InstructorListResponse> {
  const { search, course_code, sem, instruction_type, page = 1, page_size = 10 } = params;
  const query: Record<string, any> = { page, page_size };
  if (search) query.search = search;
  if (course_code) query.course_code = course_code;
  if (sem) query.sem = sem;
  if (instruction_type) query.instruction_type = instruction_type;

  const { data } = await apiClient.get<InstructorListResponse>(`${BASE}/all-instructors`, {
    params: query,
  });
  return data;
}

export async function getInstructorFilters(): Promise<InstructorFiltersResponse> {
  const { data } = await apiClient.get<InstructorFiltersResponse>(`${BASE}/instructor-filters`);
  return data;
}

export async function createInstructor(
  payload: Omit<Instructor, 'is_deleted'>
): Promise<Instructor> {
  const { data } = await apiClient.post<Instructor>(`${BASE}/create-instruction-course`, payload);
  return data;
}

export async function updateInstructor(
  instructor_ldap: string,
  payload: Partial<Instructor>
): Promise<Instructor> {
  const { data } = await apiClient.put<Instructor>(
    `${BASE}/update-instructor/${instructor_ldap}`,
    payload
  );
  return data;
}

export async function deleteInstructor(instructor_ldap: string): Promise<void> {
  await apiClient.delete(`${BASE}/delete-instructor/${instructor_ldap}`);
}

export async function fetchCourseData(course_id: string) {
  const { data } = await apiClient.get(
    `/bodhika/api/v1/sessions/consolidated-attendance/${course_id}`
  );
  return data;
}
