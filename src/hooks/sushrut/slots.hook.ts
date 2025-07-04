import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSlots,
  getSlotsByID,
  CreateSlots,
  deleteSlotByID,
  updateSlotByID,
} from '@/api/sushrut/slots.api';
import type { CreateSlotsPayload, Slots } from '@/types';

export function useSushrutSlots() {
  return useQuery({
    queryKey: ['get-slots'],
    queryFn: getSlots,
  });
}

export function useSushrutSlot(id: string) {
  return useQuery({
    queryKey: ['get-slot', id],
    queryFn: () => getSlotsByID(id),
    enabled: !!id,
  });
}

export function useSushrutCreateSlots() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: CreateSlots,
    onSuccess: () => {
      // Invalidate the main slots query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['get-slots'] });
    },
  });
}

export const useSushrutUpdateSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateSlotsPayload }) =>
      updateSlotByID(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-slots'] });
    },
  });
};

export const useSushrutDeleteSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSlotByID(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-slots'] });
    },
  });
};
