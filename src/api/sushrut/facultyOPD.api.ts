import { apiClient } from '@/core';
import type {
  FacultyOPDClaim,
  CreateFacultyOPDClaimPayload,
  UpdateFacultyOPDClaimPayload,
} from '@/types';

const BASE = '/sushrut/api/v1/faculty-opd/';

export async function getFacultyOPDClaims(): Promise<FacultyOPDClaim[]> {
  const { data } = await apiClient.get<FacultyOPDClaim[]>(BASE);
  return data;
}

export async function getFacultyOPDClaimById(id: string): Promise<FacultyOPDClaim> {
  const { data } = await apiClient.get<FacultyOPDClaim>(`${BASE}${id}/`);
  return data;
}

export async function createFacultyOPDClaim(payload: CreateFacultyOPDClaimPayload) {
  const { data } = await apiClient.post<FacultyOPDClaim>(BASE, payload, {
    silentError: false,
  });
  return data;
}

export async function updateFacultyOPDClaim(id: string, payload: UpdateFacultyOPDClaimPayload) {
  const { data } = await apiClient.put<FacultyOPDClaim>(`${BASE}${id}/`, payload, {
    silentError: false,
  });
  return data;
}

export async function deleteFacultyOPDClaim(id: string) {
  await apiClient.delete(`${BASE}${id}/`);
}
