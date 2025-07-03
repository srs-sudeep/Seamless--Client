import { apiClient } from '@/core';
import type {
  StudentReimbursement,
  CreateStudentReimbursementPayload,
  UpdateStudentReimbursementPayload,
} from '@/types';

const BASE = '/sushrut/api/v1/student-reimbursment/';

export async function getStudentReimbursements(): Promise<StudentReimbursement[]> {
  const { data } = await apiClient.get<StudentReimbursement[]>(BASE);
  return data;
}

export async function getStudentReimbursementById(id: string): Promise<StudentReimbursement> {
  const { data } = await apiClient.get<StudentReimbursement>(`${BASE}${id}/`);
  return data;
}

export async function createStudentReimbursement(payload: CreateStudentReimbursementPayload) {
  const { data } = await apiClient.post<StudentReimbursement>(BASE, payload, {
    silentError: false,
  });
  return data;
}

export async function updateStudentReimbursement(
  id: string,
  payload: UpdateStudentReimbursementPayload
) {
  const { data } = await apiClient.put<StudentReimbursement>(`${BASE}${id}/`, payload, {
    silentError: false,
  });
  return data;
}

export async function deleteStudentReimbursement(id: string) {
  await apiClient.delete(`${BASE}${id}/`);
}
