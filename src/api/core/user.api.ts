import { apiClient } from '@/core/apiClient';
import type { UserAPI, UserFiltersResponse, GetUsersParams } from '@/types';

export async function getUsers(params: GetUsersParams = {}): Promise<UserAPI[]> {
  const { search, status, roles, limit = 10, offset = 0 } = params;

  const query: Record<string, any> = { limit, offset };
  if (search) query.search = search;
  if (typeof status === 'boolean') query.status = status;
  if (roles && roles.length > 0) query.roles = roles;

  const { data } = await apiClient.get<UserAPI[]>('/core/api/v1/users/', { params: query });
  return data;
}

export async function assignRoleToUser(user_id: string, role_id: number) {
  await apiClient.post(`/core/api/v1/users/${user_id}/roles/${role_id}`);
}

export async function removeRoleFromUser(user_id: string, role_id: number) {
  await apiClient.delete(`/core/api/v1/users/${user_id}/roles/${role_id}`);
}

export async function getUserFilters(): Promise<UserFiltersResponse> {
  const { data } = await apiClient.get<UserFiltersResponse>('/core/api/v1/users/filters');
  return data;
}
