import { useQuery } from '@tanstack/react-query';
import { getAttendance } from '@/api';
import type { GetAttendanceParams, AttendanceAPIResponse } from '@/types';

export function useAttendance(params: GetAttendanceParams, enabled = true) {
  return useQuery<AttendanceAPIResponse>({
    queryKey: ['attendance', params],
    queryFn: () => getAttendance(params),
    enabled,
  });
}
