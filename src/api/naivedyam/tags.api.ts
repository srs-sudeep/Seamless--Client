import { apiClient, NAIVEDYAM_URL } from '@/core';
import type { CreateTagDto, Tag } from '@/types';

const BASE = `${NAIVEDYAM_URL}/tags/`;

export async function getTags(): Promise<Tag[]> {
  const { data } = await apiClient.get<Tag[]>(BASE);
  return data;
}

export async function createTag(payload: CreateTagDto): Promise<Tag> {
  const { data } = await apiClient.post<Tag>(BASE, payload);
  return data;
}

export async function updateTag(id: number, payload: Partial<CreateTagDto>): Promise<Tag> {
  const { data } = await apiClient.put<Tag>(`${BASE}${id}`, payload);
  return data;
}

export async function deleteTag(id: number): Promise<void> {
  await apiClient.delete(`${BASE}${id}`);
}
