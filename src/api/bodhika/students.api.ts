import { apiClient } from '@/core';
import type { Student, StudentAttendanceResponse } from '@/types';

export async function getStudents(): Promise<Student[]> {
  const { data } = await apiClient.get<Student[]>('/bodhika/api/v1/courses/all-students');
  return data;
}

export async function createStudent(payload: Student): Promise<Student> {
  const { data } = await apiClient.post<Student>(
    '/bodhika/api/v1/courses/create-student-course',
    payload
  );
  return data;
}

export async function getStudentAttendance(): Promise<StudentAttendanceResponse> {
  const { data } = await apiClient.get<StudentAttendanceResponse>(
    '/bodhika/api/v1/sessions/attendance/student/indi'
  );
  return data;
}
