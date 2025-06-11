import { apiClient } from '@/core';
import type { Slot } from '@/types/bodhika/slots.types';

export async function getSlots(): Promise<Slot[]> {
  const { data } = await apiClient.get<Slot[]>('/bodhika/api/v1/slots/');
  return data;
}

export async function updateSlot(slot_id: string, payload: Omit<Slot, 'slot_id'>) {
  const { data } = await apiClient.put<Slot>(`/bodhika/api/v1/slots/${slot_id}`, payload);
  return data;
}

export async function deleteSlot(slot_id: string) {
  await apiClient.delete(`/bodhika/api/v1/slots/${slot_id}`);
}

export async function createSlot(payload: Slot) {
  const { data } = await apiClient.post<Slot>('/bodhika/api/v1/slots/', payload);
  return data;
}
