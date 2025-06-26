import { apiClient } from '@/core';
import type { StudentVendor } from '@/types';
const BASE = '/naivedyam/api/v1/student_vendor/';

export async function getStudentVendors(): Promise<StudentVendor[]> {
  const { data } = await apiClient.get<StudentVendor[]>(BASE);
  return data;
}
