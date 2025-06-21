import { apiClient } from '@/core';
import type { Course } from '@/types';

export async function getCourses(): Promise<Course[]> {
  const { data } = await apiClient.get<Course[]>('bodhika/api/v1/courses/courses-details');
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
