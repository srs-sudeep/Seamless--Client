import { createMenu, deleteMenu, getMenus, updateMenu } from '@/api';
import type { CreateMenuDto, Menu } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useMenus() {
  return useQuery<Menu[]>({
    queryKey: ['menus'],
    queryFn: getMenus,
  });
}

export function useCreateMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });
}

export function useUpdateMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      schedule_id,
      payload,
    }: {
      schedule_id: number;
      payload: Partial<CreateMenuDto>;
    }) => updateMenu(schedule_id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });
}

export function useDeleteMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (schedule_id: number) => deleteMenu(schedule_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });
}
