export interface attendance {
  student_ldap: string;
  timestamp: string;
  room_id: string;
  device_id: string;
  status: string;
}

export interface AttendanceSession {
  session_id: string;
  course_id: string;
  course_name: string;
  sem: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  room_id: string;
  room_name: string;
  device_id: string;
  timestamp: string;
}

export interface AttendanceCourse {
  course_id: string;
  course_name: string;
  sem: string;
  is_registered: boolean;
  total_sessions: number;
  present_count: number;
  attendance_percentage: number;
  has_consecutive_absences: boolean;
  consecutive_absence_count: number;
  consecutive_absence_sessions: AttendanceSession[];
  attendances: AttendanceSession[];
}

export interface StudentAttendanceResponse {
  insti_id: string;
  courses: AttendanceCourse[];
}
