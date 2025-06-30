import { apiClient, BODHIKA_URL } from '@/core';
import type { Student, StudentAttendanceResponse } from '@/types';
const BASE = `${BODHIKA_URL}/sessions/`;

export async function getStudents(): Promise<Student[]> {
  const { data } = await apiClient.get<Student[]>(`${BASE}all-students`);
  return data;
}

export async function createStudent(payload: Student): Promise<Student> {
  const { data } = await apiClient.post<Student>(`${BASE}create-student-course`, payload, {
    silentError: false,
  });
  return data;
}

export async function getStudentAttendance(): Promise<StudentAttendanceResponse> {
  const { data } = await apiClient.get<StudentAttendanceResponse>(`${BASE}attendance/student/indi`);
  return data;
}
