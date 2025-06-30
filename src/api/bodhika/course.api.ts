import { apiClient, BODHIKA_URL } from '@/core';
import type { Course, CourseFiltersResponse, CourseListResponse, GetCoursesParams } from '@/types';

const BASE = `${BODHIKA_URL}/courses/`;

export async function getCourses(params: GetCoursesParams = {}): Promise<CourseListResponse> {
  const { search, sem, slot_id, room_id, course_code, page = 1, page_size = 10 } = params;

  const query: Record<string, any> = {
    page,
    page_size,
  };
  if (search) query.search = search;
  if (sem) query.sem = sem;
  if (slot_id) query.slot_id = slot_id;
  if (room_id) query.room_id = room_id;
  if (course_code) query.course_code = course_code;

  const { data } = await apiClient.get<CourseListResponse>(`${BASE}/courses-details`, {
    params: query,
  });
  return data;
}

export async function createCourse(payload: Course[]): Promise<Course> {
  const { data } = await apiClient.post<Course>(`${BASE}create-course-with-instructors`, payload, {
    silentError: false,
  });
  return data;
}

export async function updateCourse(course_id: string, payload: Partial<Course>): Promise<Course> {
  const { data } = await apiClient.put<Course>(`${BASE}update-course/${course_id}`, payload, {
    silentError: false,
  });
  return data;
}

export async function deleteCourse(course_id: string): Promise<void> {
  await apiClient.delete(`${BASE}delete-course/${course_id}`);
}

export async function getMyInstructorCourses(): Promise<Course[]> {
  const { data } = await apiClient.get<Course[]>(`${BASE}my-courses/instructor`);
  return data;
}

export async function getMyStudentCourses(): Promise<Course[]> {
  const { data } = await apiClient.get<Course[]>(`${BASE}my-courses/student`);
  return data;
}

export async function getCourseFilters(): Promise<CourseFiltersResponse> {
  const { data } = await apiClient.get<CourseFiltersResponse>(`${BASE}filters`);
  return data;
}
