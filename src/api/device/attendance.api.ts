import { apiClient } from '@/core';
import type { Attendance } from '@/types';

export async function getAttendances(): Promise<Attendance[]> {
  const { data } = await apiClient.get<Attendance[]>('/device/api/v1/attendance/');
  return data;
}
