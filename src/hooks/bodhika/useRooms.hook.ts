import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomDeviceMappings,
  createRoomDeviceMapping,
  deleteRoomDeviceMapping,
} from '@/api/bodhika/rooms.api';
import type { Room } from '@/types/bodhika/rooms.types';

export function useRooms() {
  return useQuery<Room[]>({
    queryKey: ['rooms'],
    queryFn: getRooms,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ room_id, payload }: { room_id: string; payload: any }) =>
      updateRoom(room_id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (room_id: string) => deleteRoom(room_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useRoomDeviceMappings() {
  return useQuery({
    queryKey: ['roomDeviceMappings'],
    queryFn: getRoomDeviceMappings,
  });
}

export function useCreateRoomDeviceMapping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRoomDeviceMapping,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomDeviceMappings'] });
    },
  });
}

export function useDeleteRoomDeviceMapping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRoomDeviceMapping,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomDeviceMappings'] });
    },
  });
}
