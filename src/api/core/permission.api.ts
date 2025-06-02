import { apiClient } from '@/core/apiClient';
import type { Permission } from '@/types';

export async function getPermissions(skip = 0, limit = 100): Promise<Permission[]> {
  const { data } = await apiClient.get<Permission[]>(
    `/core/api/v1/rbac/permissions?skip=${skip}&limit=${limit}`
  );
  return data;
}

export async function updatePermission(
  permission_id: number,
  payload: Omit<Permission, 'permission_id' | 'created_at' | 'updated_at'>
) {
  const { data } = await apiClient.put<Permission>(
    `/core/api/v1/rbac/permissions/${permission_id}`,
    payload
  );
  return data;
}

export async function deletePermission(permission_id: number) {
  await apiClient.delete(`/core/api/v1/rbac/permissions/${permission_id}`);
}

export async function createPermission(
  payload: Omit<Permission, 'permission_id' | 'created_at' | 'updated_at'>
) {
  const { data } = await apiClient.post<Permission>('/core/api/v1/rbac/permissions', payload);
  return data;
}
