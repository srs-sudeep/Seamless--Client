import { createModule, deleteModule, getModules, updateModule } from '@/api';
import type { Module } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useModules() {
  return useQuery<Module[]>({
    queryKey: ['modules'],
    queryFn: () => getModules(),
  });
}

export function useUpdateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      module_id,
      payload,
    }: {
      module_id: number;
      payload: Omit<Module, 'module_id' | 'created_at' | 'updated_at'>;
    }) => updateModule(module_id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
    },
  });
}

export function useDeleteModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (module_id: number) => deleteModule(module_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
    },
  });
}

export function useCreateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createModule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
    },
  });
}
