import { apiClient, BODHIKA_URL } from '@/core';
import type { Slot } from '@/types';
const BASE = `${BODHIKA_URL}/api/v1/slots/`;
export async function getSlots(): Promise<Slot[]> {
  const { data } = await apiClient.get<Slot[]>(`${BASE}`);
  return data;
}

export async function updateSlot(slot_id: string, payload: Omit<Slot, 'slot_id'>): Promise<Slot> {
  const { data } = await apiClient.put<Slot>(`${BASE}${slot_id}`, payload);
  return data;
}

export async function deleteSlot(slot_id: string): Promise<void> {
  await apiClient.delete(`${BASE}${slot_id}`);
}

export async function createSlot(payload: Slot): Promise<Slot> {
  const { data } = await apiClient.post<Slot>(`${BASE}`, payload);
  return data;
}
