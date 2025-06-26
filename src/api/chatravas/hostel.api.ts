import { apiClient } from '@/core';
import type {
  CreateHostelDto,
  GetHostelsParams,
  Hostel,
  HostelListResponse,
  UpdateHostelDto,
} from '@/types/chatravas/hostel.types';

const BASE = '/chatravas/api/v1/hostel/';

export async function getHostels(params: GetHostelsParams = {}): Promise<HostelListResponse> {
  const { search, limit = 10, offset = 0 } = params;
  const query: Record<string, any> = { limit, offset };
  if (search) query.search = search;

  const { data } = await apiClient.get<HostelListResponse>(BASE, { params: query });
  return data;
}

export async function getHostelById(hostel_id: string): Promise<Hostel> {
  const { data } = await apiClient.get<Hostel>(`${BASE}${hostel_id}/`);
  return data;
}

export async function createHostel(payload: CreateHostelDto): Promise<Hostel> {
  const { data } = await apiClient.post<Hostel>(BASE, payload);
  return data;
}

export async function updateHostel(hostel_id: string, payload: UpdateHostelDto): Promise<Hostel> {
  const { data } = await apiClient.patch<Hostel>(`${BASE}${hostel_id}/`, payload);
  return data;
}

export async function deleteHostel(hostel_id: string): Promise<void> {
  await apiClient.delete(`${BASE}${hostel_id}/`);
}
