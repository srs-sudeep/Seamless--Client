import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDevices, updateDevice, deleteDevice } from '@/api';
import type { Device } from '@/types';

export function useDevices() {
  return useQuery<Device[]>({
    queryKey: ['devices'],
    queryFn: getDevices,
  });
}

export function useUpdateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ device_id, payload }: { device_id: string; payload: any }) =>
      updateDevice(device_id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (device_id: string) => deleteDevice(device_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
}
