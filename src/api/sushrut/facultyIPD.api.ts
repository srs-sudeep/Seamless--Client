import { apiClient } from '@/core';
import type { FacultyIPDClaim, CreateFacultyIPDPayload, UpdateFacultyIPDPayload } from '@/types';

const BASE = '/sushrut/api/v1/faculty-ipd/';

export async function getFacultyIPDClaims(): Promise<FacultyIPDClaim[]> {
  const { data } = await apiClient.get<FacultyIPDClaim[]>(BASE);
  return data;
}

export async function getFacultyIPDClaimById(id: string): Promise<FacultyIPDClaim> {
  const { data } = await apiClient.get<FacultyIPDClaim>(`${BASE}${id}/`);
  return data;
}

export async function createFacultyIPDClaim(payload: CreateFacultyIPDPayload) {
  const { data } = await apiClient.post<FacultyIPDClaim>(BASE, payload, {
    silentError: false,
  });
  return data;
}

export async function updateFacultyIPDClaim(id: string, payload: UpdateFacultyIPDPayload) {
  const { data } = await apiClient.put<FacultyIPDClaim>(`${BASE}${id}/`, payload, {
    silentError: false,
  });
  return data;
}

export async function deleteFacultyIPDClaim(id: string) {
  await apiClient.delete(`${BASE}${id}/`);
}
