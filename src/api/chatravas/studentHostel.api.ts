import { apiClient } from '@/core';
import type {
  StudentHostel,
  GetStudentHostelsParams,
  StudentHostelListResponse,
  CreateStudentHostelDto,
  DeleteStudentHostelDto,
} from '@/types/chatravas/studentHostel.types';

const BASE = '/chatravas/api/v1/student_hostel/';

export async function getStudentHostels(
  params: GetStudentHostelsParams = {}
): Promise<StudentHostelListResponse> {
  const { is_deleted, search, limit = 10, offset = 0 } = params;
  const query: Record<string, any> = { limit, offset };
  if (typeof is_deleted === 'boolean') query.is_deleted = is_deleted;
  if (search) query.search = search;
  const { data } = await apiClient.get<StudentHostelListResponse>(BASE, { params: query });
  return data;
}

export async function createStudentHostel(payload: CreateStudentHostelDto): Promise<StudentHostel> {
  const { data } = await apiClient.post<StudentHostel>(BASE, payload);
  return data;
}

// "Delete" is a PATCH to set is_deleted=true (and optionally end_date)
export async function deleteStudentHostel(
  id: number,
  payload: DeleteStudentHostelDto
): Promise<StudentHostel> {
  const { data } = await apiClient.patch<StudentHostel>(`${BASE}${id}/`, payload);
  return data;
}
