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

// Additional endpoints for specific operations
export async function approveFacultyIPDClaim(id: string) {
  const { data } = await apiClient.put<FacultyIPDClaim>(
    `${BASE}${id}/approve/`,
    {},
    {
      silentError: false,
    }
  );
  return data;
}

export async function rejectFacultyIPDClaim(id: string, reason?: string) {
  const { data } = await apiClient.put<FacultyIPDClaim>(
    `${BASE}${id}/reject/`,
    { reason },
    {
      silentError: false,
    }
  );
  return data;
}

export async function submitForReview(id: string) {
  const { data } = await apiClient.put<FacultyIPDClaim>(
    `${BASE}${id}/submit-review/`,
    {},
    {
      silentError: false,
    }
  );
  return data;
}
