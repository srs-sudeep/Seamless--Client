import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getAttendances, createBulkAttendance } from '@/api';
import type { Attendance, Bulk } from '@/types';

export function useAttendances() {
  return useQuery<Attendance[]>({
    queryKey: ['attendances'],
    queryFn: getAttendances,
  });
}

export function useBulkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Bulk) => createBulkAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
    },
  });
}
