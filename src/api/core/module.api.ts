import { apiClient } from '@/core';
import type { Module } from '@/types';

export async function getModules(): Promise<Module[]> {
  const { data } = await apiClient.get<Module[]>('/core/api/v1/modules/');
  return data;
}

export async function updateModule(
  module_id: number,
  payload: Omit<Module, 'module_id' | 'created_at' | 'updated_at'>
) {
  const { data } = await apiClient.put<Module>(`/core/api/v1/modules/${module_id}`, payload);
  return data;
}

export async function deleteModule(module_id: number) {
  await apiClient.delete(`/core/api/v1/modules/${module_id}`);
}

export async function createModule(
  payload: Omit<Module, 'module_id' | 'created_at' | 'updated_at'>
) {
  const { data } = await apiClient.post<Module>('/core/api/v1/modules/', payload);
  return data;
}
