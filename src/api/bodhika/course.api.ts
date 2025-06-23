import { apiClient } from '@/core';
import type { Course, GetCoursesParams, CourseListResponse, CourseFiltersResponse } from '@/types';

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

  const { data } = await apiClient.get<CourseListResponse>(
    'bodhika/api/v1/courses/courses-details',
    { params: query }
  );
  return data;
}

export async function createCourse(payload: Course[]): Promise<Course> {
  const { data } = await apiClient.post<Course>(
    'bodhika/api/v1/courses/create-course-with-instructors',
    payload
  );
  return data;
}

export async function updateCourse(course_id: string, payload: Partial<Course>): Promise<Course> {
  const { data } = await apiClient.put<Course>(
    `bodhika/api/v1/courses/update-course/${course_id}`,
    payload
  );
  return data;
}

export async function deleteCourse(course_id: string): Promise<void> {
  await apiClient.delete(`bodhika/api/v1/courses/delete-course/${course_id}`);
}

export async function getMyInstructorCourses(): Promise<Course[]> {
  const { data } = await apiClient.get<Course[]>('/bodhika/api/v1/courses/my-courses/instructor');
  return data;
}

export async function getMyStudentCourses(): Promise<Course[]> {
  const { data } = await apiClient.get<Course[]>('/bodhika/api/v1/courses/my-courses/student');
  return data;
}

export async function getCourseFilters(): Promise<CourseFiltersResponse> {
  const { data } = await apiClient.get<CourseFiltersResponse>('bodhika/api/v1/courses/filters');
  return data;
}
