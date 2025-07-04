import { apiClient } from '@/core';
import type { Slots, CreateSlotsPayload } from '@/types';

const BASE = '/sushrut/api/v1/slots/';

export async function getSlots(): Promise<Slots[]> {
  const { data } = await apiClient.get<Slots[]>(BASE);
  return data;
}

export async function getSlotsByID(id: string): Promise<Slots> {
  const { data } = await apiClient.get<Slots>(`${BASE}${id}`);
  return data;
}

export async function CreateSlots(payload: CreateSlotsPayload) {
  const { data } = await apiClient.post<Slots>(BASE, payload, { silentError: false });
  return data;
}

export async function deleteSlotByID(id: string): Promise<Slots> {
  const { data } = await apiClient.delete<Slots>(`${BASE}${id}`);
  return data;
}

export async function updateSlotByID(id: string, payload: CreateSlotsPayload): Promise<Slots> {
  console.log(payload, 'I am payload');
  const { data } = await apiClient.put<Slots>(`${BASE}${id}`, payload);
  return data;
}
