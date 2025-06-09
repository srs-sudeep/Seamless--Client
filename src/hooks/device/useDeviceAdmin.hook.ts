import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDeviceAdmins, createDeviceAdmin, updateDeviceAdmin, deleteDeviceAdmin } from '@/api';
import type { DeviceAdmin } from '@/types';

export function useDeviceAdmins() {
  return useQuery<DeviceAdmin[]>({
    queryKey: ['deviceAdmins'],
    queryFn: getDeviceAdmins,
  });
}

export function useCreateDeviceAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload }: { payload: any }) => createDeviceAdmin(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deviceAdmins'] });
    },
  });
}

export function useUpdateDeviceAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ldapid, payload }: { ldapid: string; payload: any }) =>
      updateDeviceAdmin(ldapid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deviceAdmins'] });
    },
  });
}

export function useDeleteDeviceAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ldapid: string) => deleteDeviceAdmin(ldapid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deviceAdmins'] });
    },
  });
}
