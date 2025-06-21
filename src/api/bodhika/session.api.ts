import { apiClient } from '@/core';
import { attendance, Session } from '@/types';

export async function createSession(payload: {
  course_id: string;
  room_ids: string[];
}): Promise<any> {
  const { data } = await apiClient.post('/bodhika/api/v1/sessions/start-session', payload);
  return data;
}

export async function getMyActiveSessions(): Promise<{ data: Session[]; status: number }> {
  const response = await apiClient.get<Session[]>('/bodhika/api/v1/sessions/active-session/me', {
    silentError: true,
  });
  return { data: response.data, status: response.status };
}

export async function getAllSessions(): Promise<Session[]> {
  const { data } = await apiClient.get<Session[]>('/bodhika/api/v1/sessions/sessions');
  return data;
}

export async function getSessionAttendance(session_id: string): Promise<attendance[]> {
  const { data } = await apiClient.get<attendance[]>(
    `/bodhika/api/v1/sessions/attendance/${session_id}`,
    { silentError: true }
  );
  return data;
}

export async function updateSession(session_id: string) {
  const { data } = await apiClient.put(`/bodhika/api/v1/sessions/stop-session/${session_id}`);
  return data;
}

export async function getSessionsByCourseId(course_id: string): Promise<Session[]> {
  const { data } = await apiClient.get<Session[]>(`/bodhika/api/v1/sessions/sessions/${course_id}`);
  return data;
}

export async function getRoomsActiveSessions() {
  const { data } = await apiClient.get<any[]>('/bodhika/api/v1/sessions/rooms-active-sessions');
  return data;
}
