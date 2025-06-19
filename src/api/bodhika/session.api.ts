import { apiClient } from '@/core';
import { Attendance } from '@/types';
import type { Session } from '@/types/bodhika/session.types';

export async function createSession(payload: { course_id: string; room_ids: string[] }) {
  const { data } = await apiClient.post('/bodhika/api/v1/sessions/start-session', payload);
  return data;
}

export async function getMyActiveSessions() {
  const response = await apiClient.get<Session[]>('/bodhika/api/v1/sessions/active-session/me', {
    silentError: true,
  });
  return { data: response.data, status: response.status };
}

export async function getAllSessions() {
  const { data } = await apiClient.get<Session[]>('/bodhika/api/v1/sessions/sessions');
  return data;
}

export async function getSessionAttendance(session_id: string): Promise<Attendance[]> {
  const { data } = await apiClient.get<Attendance[]>(
    `/bodhika/api/v1/sessions/attendance/${session_id}`,
    { silentError: true }
  );
  return data;
}

export async function updateSession(session_id: string) {
  const { data } = await apiClient.put(`/bodhika/api/v1/sessions/stop-session/${session_id}`);
  return data;
}
