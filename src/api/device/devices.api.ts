import { apiClient, DEVICE_URL } from '@/core';
import type { Device } from '@/types';

const BASE = `${DEVICE_URL}/host`;

export async function getDevices(): Promise<Device[]> {
  const { data } = await apiClient.get<Device[]>(`${BASE}/devices`);
  return data;
}

export async function updateDevice(
  device_id: string,
  payload: Omit<Device, 'device_id' | 'created_at' | 'updated_at'>
) {
  const { data } = await apiClient.put<Device>(`${BASE}/device/${device_id}/services`, payload);
  return data;
}

export async function deleteDevice(device_id: string) {
  await apiClient.delete(`/device/api/v1/devices/${device_id}`);
}
