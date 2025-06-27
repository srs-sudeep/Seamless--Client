import { apiClient } from '@/core';
import type { StudentVendor } from '@/types/naivedyam/studentVendor.types';

const BASE = '/naivedyam/api/v1/student_vendor/';

export async function getStudentVendors(): Promise<StudentVendor[]> {
  const { data } = await apiClient.get<StudentVendor[]>(BASE);
  return data;
}

export async function createStudentVendor(
  payload: Omit<StudentVendor, 'is_active'>
): Promise<StudentVendor> {
  const { data } = await apiClient.post<StudentVendor>(BASE, payload);
  return data;
}

export async function deleteStudentVendor(student_id: string, vendor_id: string): Promise<void> {
  await apiClient.delete(`${BASE}${student_id}/${vendor_id}/`);
}
