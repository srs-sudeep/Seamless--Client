export interface AttendanceRecord {
  [student_id: string]: {
    [date: string]: 'present' | 'absent';
  };
}

export interface GetAttendanceParams {
  institute_ids: string[];
  start_date: string;
  end_date: string;
  is_deleted?: boolean;
}

export interface AttendanceAPIResponse extends AttendanceRecord {}
