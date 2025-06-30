import { apiClient, NAIVEDYAM_URL } from '@/core';
import type { CreateMenuDto, Menu } from '@/types';

const BASE = `${NAIVEDYAM_URL}/menu/`;

export async function getMenus(): Promise<Menu[]> {
  const { data } = await apiClient.get<Menu[]>(BASE);
  return data;
}

export async function createMenu(payload: CreateMenuDto) {
  const { data } = await apiClient.post<Menu>(BASE, payload, {
    silentError: false,
  });
  return data;
}

export async function updateMenu(schedule_id: number, payload: Partial<CreateMenuDto>) {
  const { data } = await apiClient.put<Menu>(`${BASE}${schedule_id}`, payload, {
    silentError: false,
  });
  return data;
}

export async function deleteMenu(schedule_id: number) {
  await apiClient.delete(`${BASE}${schedule_id}`);
}
