import { apiClient } from '@/core';
import type { Insurance, CreateInsurancePayload } from '@/types';

const BASE = '/sushrut/api/v1/insurance/';

export async function getInsurances(): Promise<Insurance[]> {
  const { data } = await apiClient.get<Insurance[]>(BASE);
  return data;
}

export async function getInsuranceById(id: string): Promise<Insurance> {
  const { data } = await apiClient.get<Insurance>(`${BASE}${id}/`);
  return data;
}

export async function createInsurance(payload: CreateInsurancePayload) {
  const { data } = await apiClient.post<Insurance>(BASE, payload, {
    silentError: false,
  });
  return data;
}
