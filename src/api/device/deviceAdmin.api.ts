import { apiClient, DEVICE_URL } from '@/core';
import type { DeviceAdmin } from '@/types';

const BASE = `${DEVICE_URL}/device-admin/`;

export async function getDeviceAdmins(): Promise<DeviceAdmin[]> {
  const { data } = await apiClient.get<DeviceAdmin[]>(`${BASE}`);
  return data;
}

export async function createDeviceAdmin(payload: Omit<DeviceAdmin, 'created_at' | 'updated_at'>) {
  const { data } = await apiClient.post<DeviceAdmin>(`${BASE}`, payload);
  return data;
}

export async function updateDeviceAdmin(
  ldapid: string,
  payload: Omit<DeviceAdmin, 'ldapid' | 'created_at' | 'updated_at'>
) {
  const { data } = await apiClient.put<DeviceAdmin>(`${BASE}${ldapid}`, payload);
  return data;
}

export async function deleteDeviceAdmin(ldapid: string) {
  await apiClient.delete(`${BASE}${ldapid}`);
}
