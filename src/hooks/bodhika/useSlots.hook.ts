import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSlots, createSlot, updateSlot, deleteSlot } from '@/api';
import type { Slot } from '@/types';

export function useSlots() {
  return useQuery<Slot[]>({
    queryKey: ['slots'],
    queryFn: getSlots,
  });
}

export function useCreateSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}

export function useUpdateSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slot_id, payload }: { slot_id: string; payload: any }) =>
      updateSlot(slot_id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}

export function useDeleteSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slot_id: string) => deleteSlot(slot_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}
