import { apiClient } from '@/core/apiClient';
import type { User } from '@/types/core/user.types';

// GET all users
export async function getUsers(): Promise<User[]> {
  const { data } = await apiClient.get<User[]>('/core/api/v1/users/');
  return data;
}

// POST assign role to user
export async function assignRoleToUser(user_id: string, role_id: number) {
  await apiClient.post(`/core/api/v1/users/${user_id}/roles/${role_id}`);
}

// DELETE remove role from user
export async function removeRoleFromUser(user_id: string, role_id: number) {
  await apiClient.delete(`/core/api/v1/users/${user_id}/roles/${role_id}`);
}
