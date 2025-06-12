export interface Room {
  room_id: string;
  room_name: string;
  is_deleted: boolean;
}

export interface RoomDeviceMapping {
  room_id: string;
  device_id: string;
}
