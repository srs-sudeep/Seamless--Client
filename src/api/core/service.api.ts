import { apiClient } from '@/core';
import type { Service } from '@/types';

export async function getServices(): Promise<Service[]> {
  const { data } = await apiClient.get<Service[]>('/core/api/v1/services/');
  return data;
}

export async function getOneService(service_id: string): Promise<Service> {
  const { data } = await apiClient.get<Service>(`/core/api/v1/services/${service_id}`);
  return data;
}

export async function createService(
  payload: Omit<Service, 'service_id' | 'created_at' | 'updated_at'>
) {
  const { data } = await apiClient.post<Service>('/core/api/v1/services/', payload);
  return data;
}

export async function updateService(
  service_id: number,
  payload: Omit<Service, 'service_id' | 'created_at' | 'updated_at'>
) {
  const { data } = await apiClient.put<Service>(`/core/api/v1/services/${service_id}`, payload);
  return data;
}

export async function deleteService(service_id: number) {
  await apiClient.delete(`/core/api/v1/services/${service_id}`);
}
