import { apiClient } from '@/core/apiClient';
import type { Route } from '@/types';

export async function getRoutes(): Promise<Route[]> {
  const { data } = await apiClient.get<Route[]>(`/core/api/v1/routes/`);
  return data;
}

export async function updateRoute(
  route_id: number,
  payload: Omit<Route, 'route_id' | 'created_at' | 'updated_at'>
) {
  const { data } = await apiClient.put<Route>(`/core/api/v1/routes/${route_id}`, payload);
  return data;
}

export async function deleteRoute(route_id: number) {
  await apiClient.delete(`/core/api/v1/routes/${route_id}`);
}

export async function createRoute(payload: Omit<Route, 'route_id' | 'created_at' | 'updated_at'>) {
  const { data } = await apiClient.post<Route>('/core/api/v1/routes/', payload);
  return data;
}
