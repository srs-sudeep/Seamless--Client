export interface Attendance {
  attendance_id: number;
  device_id: string;
  timestamp: string;
  insti_id: string;
  remark: string;
}

export interface Bulk {
  device_id: string;
  insti_ids: string[];
  remark: string;
}
