import { apiClient } from '@/core';
import type { Device } from '@/types';

export async function getDevices(): Promise<Device[]> {
  const { data } = await apiClient.get<Device[]>('/device/api/v1/host/devices');
  return data;
}

export async function updateDevice(
  device_id: string,
  payload: Omit<Device, 'device_id' | 'created_at' | 'updated_at'>
) {
  const { data } = await apiClient.put<Device>(
    `/device/api/v1/host/device/${device_id}/services`,
    payload
  );
  return data;
}

export async function deleteDevice(device_id: string) {
  await apiClient.delete(`/device/api/v1/devices/${device_id}`);
}
