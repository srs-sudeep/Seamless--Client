import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, assignRoleToUser, removeRoleFromUser } from '@/api/core/user.api';
import type { User } from '@/types/core/user.types';

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: getUsers,
  });
}

export function useAssignRoleToUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ user_id, role_id }: { user_id: string; role_id: number }) => {
      await assignRoleToUser(user_id, role_id);
    },
    onSuccess: _data => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useRemoveRoleFromUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ user_id, role_id }: { user_id: string; role_id: number }) => {
      await removeRoleFromUser(user_id, role_id);
    },
    onSuccess: _data => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
