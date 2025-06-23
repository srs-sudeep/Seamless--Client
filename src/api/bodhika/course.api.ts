import { apiClient } from '@/core';
import type { Course, GetCoursesParams, CourseListResponse } from '@/types';

export async function getCourses(params: GetCoursesParams = {}): Promise<CourseListResponse> {
  const { search, semester, rooms, limit = 10, offset = 0 } = params;

  const query: Record<string, any> = { limit, offset };
  if (search) query.search = search;
  if (semester) query.semester = semester;
  if (rooms && rooms.length > 0) {
    rooms.forEach((roomId, idx) => {
      query[`rooms[${idx}]`] = roomId;
    });
  }

  const paramsSerializer = (paramsObj: Record<string, any>) => {
    const usp = new URLSearchParams();
    Object.entries(paramsObj).forEach(([key, value]) => {
      if (key.startsWith('rooms[')) {
        usp.append('rooms', value as any);
      } else {
        usp.append(key, value as any);
      }
    });
    return usp.toString();
  };

  const { data } = await apiClient.get<CourseListResponse>(
    'bodhika/api/v1/courses/courses-details',
    {
      params: query,
      paramsSerializer,
    }
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
