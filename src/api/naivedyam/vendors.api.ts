import { apiClient } from '@/core';
import type { Vendor } from '@/types';
import { NAIVEDYAM_URL } from '@/core';

const BASE = `${NAIVEDYAM_URL}/vendor/`;

export async function getVendors(): Promise<Vendor[]> {
  const { data } = await apiClient.get<Vendor[]>(BASE);
  return data;
}

export async function createVendor(payload: Omit<Vendor, 'id'>) {
  const { data } = await apiClient.post<Vendor>(BASE, payload);
  return data;
}

export async function updateVendor(id: string, payload: Partial<Vendor>) {
  const { data } = await apiClient.put<Vendor>(`${BASE}${id}/`, payload);
  return data;
}

export async function deleteVendor(id: string) {
  await apiClient.delete(`${BASE}${id}/`);
}
