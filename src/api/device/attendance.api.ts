import { apiClient, DEVICE_URL } from '@/core';
import type { Attendance, Bulk } from '@/types';

const BASE = `${DEVICE_URL}attendance/`;

export async function getAttendances(): Promise<Attendance[]> {
  const { data } = await apiClient.get<Attendance[]>(`${BASE}`);
  return data;
}

export async function createBulkAttendance(data: Bulk) {
  const { data: responseData } = await apiClient.post(`${BASE}/bulk`, data, {
    silentError: false,
  });
  return responseData;
}
