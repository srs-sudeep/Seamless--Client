import { apiClient } from '@/core/apiClient';
import type { Role } from '@/types/core/rolesApi.types';

export async function getRoles(): Promise<Role[]> {
  const { data } = await apiClient.get<Role[]>('/core/api/v1/rbac/roles');
  return data;
}

export async function createRole(payload: Omit<Role, 'role_id' | 'created_at' | 'updated_at'>) {
  const { data } = await apiClient.post<Role>('/core/api/v1/rbac/roles', payload);
  return data;
}

export async function updateRole(
  role_id: number,
  payload: Omit<Role, 'role_id' | 'created_at' | 'updated_at'>
) {
  const { data } = await apiClient.put<Role>(`/core/api/v1/rbac/roles/${role_id}`, payload);
  return data;
}

export async function deleteRole(role_id: number) {
  await apiClient.delete(`/core/api/v1/rbac/roles/${role_id}`);
}

export async function getRolePermissions(role_id: number) {
  const { data } = await apiClient.get(`/core/api/v1/rbac/roles/${role_id}/permissions/all`);
  return data;
}
