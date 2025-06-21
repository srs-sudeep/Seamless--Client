import { apiClient } from '@/core/apiClient';
import type { GetUsersParams, UserAPI, UserFiltersResponse } from '@/types';

export async function getUsers(params: GetUsersParams = {}): Promise<UserAPI[]> {
  const { search, status, roles, limit = 10, offset = 0 } = params;

  const query: Record<string, any> = { limit, offset };
  if (search) query.search = search;
  if (typeof status === 'boolean') query.status = status;
  if (roles && roles.length > 0) {
    // Remove this: query.roles = roles;
    // Instead, add each role as a separate param
    roles.forEach((roleId, idx) => {
      query[`roles[${idx}]`] = roleId;
    });
  }

  // Convert roles[0]=1&roles[1]=2 to roles=1&roles=2
  const paramsSerializer = (paramsObj: Record<string, any>) => {
    const usp = new URLSearchParams();
    Object.entries(paramsObj).forEach(([key, value]) => {
      if (key.startsWith('roles[')) {
        usp.append('roles', value as any);
      } else {
        usp.append(key, value as any);
      }
    });
    return usp.toString();
  };

  const { data } = await apiClient.get<UserAPI[]>('/core/api/v1/users/', {
    params: query,
    paramsSerializer,
  });
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
