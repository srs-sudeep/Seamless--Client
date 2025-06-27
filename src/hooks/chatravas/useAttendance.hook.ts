import { useQuery } from '@tanstack/react-query';
import { getAttendance } from '@/api/chatravas/attendance.api';
import type {
  GetAttendanceParams,
  AttendanceAPIResponse,
} from '@/types/chatravas/attendance.types';

export function useAttendance(params: GetAttendanceParams, enabled = true) {
  return useQuery<AttendanceAPIResponse>({
    queryKey: ['attendance', params],
    queryFn: () => getAttendance(params),
    enabled,
  });
}
