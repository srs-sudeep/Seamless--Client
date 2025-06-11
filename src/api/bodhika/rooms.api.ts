import { apiClient } from '@/core';
import type { Room, RoomDeviceMapping } from '@/types/bodhika/rooms.types';

export async function getRooms(): Promise<Room[]> {
  const { data } = await apiClient.get<Room[]>('/bodhika/api/v1/rooms/');
  return data;
}

export async function createRoom(payload: Omit<Room, 'is_deleted'>) {
  const { data } = await apiClient.post<Room>('/bodhika/api/v1/rooms/', payload);
  return data;
}

export async function updateRoom(room_id: string, payload: Omit<Room, 'room_id' | 'is_deleted'>) {
  const { data } = await apiClient.put<Room>(`/bodhika/api/v1/rooms/${room_id}`, payload);
  return data;
}

export async function deleteRoom(room_id: string) {
  await apiClient.delete(`/bodhika/api/v1/rooms/${room_id}`);
}

export async function getRoomDeviceMappings(): Promise<RoomDeviceMapping[]> {
  const { data } = await apiClient.get<RoomDeviceMapping[]>(
    '/bodhika/api/v1/roomsdevices-rooms/mappings'
  );
  return data;
}

export async function createRoomDeviceMapping(payload: { room_id: string; device_id: string }) {
  const { data } = await apiClient.post('/bodhika/api/v1/rooms/create/room-devices', payload);
  return data;
}

export async function deleteRoomDeviceMapping(payload: { room_id: string; device_id: string }) {
  const { data } = await apiClient.delete('/bodhika/api/v1/rooms/delete/room-devices', {
    data: payload,
  });
  return data;
}
