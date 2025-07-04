import { apiClient } from '@/core';
import type { AdditionalInfo, CreateAdditionalInfoPayload } from '@/types';

const BASE = '/sushrut/api/v1/additional/';

export async function getAdditionalInfo(): Promise<AdditionalInfo[]> {
  const { data } = await apiClient.get<AdditionalInfo[]>(BASE);
  return data;
}

export async function getAdditionalInfoByID(id: string): Promise<AdditionalInfo> {
  const { data } = await apiClient.get<AdditionalInfo>(`${BASE}${id}/`);
  return data;
}

export async function CreateAdditionalInfo(payload: CreateAdditionalInfoPayload) {
  const { data } = await apiClient.post<AdditionalInfo>(BASE, payload, { silentError: false });
  return data;
}
