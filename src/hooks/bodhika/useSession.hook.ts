import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createSession,
  getMyActiveSessions,
  getAllSessions,
  getSessionAttendance,
  updateSession,
  getSessionsByCourseId,
  getRoomsActiveSessions,
} from '@/api';
import type { Session, attendance } from '@/types';

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useMyActiveSessions() {
  return useQuery<{ data: Session[]; status: number }>({
    queryKey: ['myActiveSessions'],
    queryFn: async () => {
      const res = await getMyActiveSessions();
      return { data: res.data, status: res.status };
    },
  });
}

export function useSessions() {
  return useQuery<Session[]>({
    queryKey: ['sessions'],
    queryFn: getAllSessions,
  });
}

export function useSessionAttendance(session_id?: string) {
  return useQuery<attendance[]>({
    queryKey: ['sessionAttendance', session_id],
    queryFn: () => getSessionAttendance(session_id!),
    enabled: !!session_id,
    refetchInterval: 1000,
  });
}

export function useSessionUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInstructorCourses'] });
      queryClient.invalidateQueries({ queryKey: ['myActiveSessions'] });
    },
  });
}

export function useSessionsByCourseId(course_id?: string) {
  return useQuery<Session[]>({
    queryKey: ['sessionsByCourseId', course_id],
    queryFn: () => getSessionsByCourseId(course_id!),
    enabled: !!course_id,
  });
}

export function useRoomsActiveSessions() {
  return useQuery<any[]>({
    queryKey: ['roomsActiveSessions'],
    queryFn: getRoomsActiveSessions,
  });
}
