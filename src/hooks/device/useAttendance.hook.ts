import { useQuery } from '@tanstack/react-query';
import { getAttendances } from '@/api';
import type { Attendance } from '@/types';

export function useAttendances() {
  return useQuery<Attendance[]>({
    queryKey: ['attendances'],
    queryFn: getAttendances,
  });
}
