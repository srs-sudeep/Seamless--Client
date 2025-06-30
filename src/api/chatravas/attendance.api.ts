import { apiClient } from '@/core';
import type { GetAttendanceParams, AttendanceAPIResponse } from '@/types';

const BASE = '/chatravas/api/v1/attendance/hostel/attendance';

export async function getAttendance(params: GetAttendanceParams): Promise<AttendanceAPIResponse> {
  const { institute_ids, start_date, end_date, is_deleted } = params;
  const query: Record<string, any> = {
    start_date,
    end_date,
    ...(typeof is_deleted === 'boolean' ? { is_deleted } : {}),
  };
  // Add all institute_ids as repeated query params
  institute_ids.forEach(id => {
    if (!query.institute_ids) query.institute_ids = [];
    query.institute_ids.push(id);
  });
  const { data } = await apiClient.get<AttendanceAPIResponse>(BASE, { params: query });
  return data;
}
