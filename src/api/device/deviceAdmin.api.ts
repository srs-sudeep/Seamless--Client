import { apiClient } from '@/core';
import type { DeviceAdmin } from '@/types';

export async function getDeviceAdmins(): Promise<DeviceAdmin[]> {
  const { data } = await apiClient.get<DeviceAdmin[]>('/device/api/v1/device-admin/');
  return data;
}

export async function createDeviceAdmin(payload: Omit<DeviceAdmin, 'created_at' | 'updated_at'>) {
  const { data } = await apiClient.post<DeviceAdmin>(`/device/api/v1/device-admin/`, payload);
  return data;
}

export async function updateDeviceAdmin(
  ldapid: string,
  payload: Omit<DeviceAdmin, 'ldapid' | 'created_at' | 'updated_at'>
) {
  const { data } = await apiClient.put<DeviceAdmin>(
    `device/api/v1/device-admin/${ldapid}`,
    payload
  );
  return data;
}

export async function deleteDeviceAdmin(ldapid: string) {
  await apiClient.delete(`device/api/v1/device-admin/${ldapid}`);
}
