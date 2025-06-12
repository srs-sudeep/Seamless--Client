import { apiClient } from '@/core';
import type { Course } from '@/types/bodhika/course.type';

export async function getCourses(): Promise<Course[]> {
  const { data } = await apiClient.get<Course[]>('bodhika/api/v1/courses/courses-details');
  return data;
}

export async function createCourse(payload: any) {
  const { data } = await apiClient.post<Course>(
    'bodhika/api/v1/courses/create-course-with-instructors',
    payload
  );
  return data;
}

export async function updateCourse(course_id: string, payload: Partial<Course>) {
  const { data } = await apiClient.put<Course>(
    `bodhika/api/v1/courses/update-course/${course_id}`,
    payload
  );
  return data;
}

export async function deleteCourse(course_id: string) {
  await apiClient.delete(`bodhika/api/v1/courses/delete-course/${course_id}`);
}
