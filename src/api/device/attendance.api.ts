import { apiClient } from '@/core';
import type { Attendance, Bulk } from '@/types';

export async function getAttendances(): Promise<Attendance[]> {
  const { data } = await apiClient.get<Attendance[]>('/device/api/v1/attendance/');
  return data;
}

export async function createBulkAttendance(data: Bulk) {
  const { data: responseData } = await apiClient.post('/device/api/v1/attendance/bulk', data);
  return responseData;
}
