import { apiClient, BODHIKA_URL } from '@/core';
import { attendance, Session } from '@/types';
const BASE = `${BODHIKA_URL}/sessions/`;

export async function createSession(payload: {
  course_id: string;
  room_ids: string[];
}): Promise<any> {
  const { data } = await apiClient.post(`${BASE}start-session`, payload, {
    silentError: false,
  });
  return data;
}

export async function getMyActiveSessions(): Promise<{ data: Session[]; status: number }> {
  const response = await apiClient.get<Session[]>(`${BASE}active-session/me`, {
    silentError: true,
  });
  return { data: response.data, status: response.status };
}

export async function getAllSessions(): Promise<Session[]> {
  const { data } = await apiClient.get<Session[]>(`${BASE}sessions`);
  return data;
}

export async function getSessionAttendance(session_id: string): Promise<attendance[]> {
  const { data } = await apiClient.get<attendance[]>(`${BASE}attendance/${session_id}`, {
    silentError: true,
  });
  return data;
}

export async function updateSession(session_id: string) {
  const { data } = await apiClient.put(
    `${BASE}stop-session/${session_id}`,
    {},
    {
      silentError: false,
    }
  );
  return data;
}

export async function getSessionsByCourseId(course_id: string): Promise<Session[]> {
  const { data } = await apiClient.get<Session[]>(`${BASE}sessions/${course_id}`);
  return data;
}

export async function getRoomsActiveSessions() {
  const { data } = await apiClient.get<any[]>(`${BASE}rooms-active-sessions`);
  return data;
}
