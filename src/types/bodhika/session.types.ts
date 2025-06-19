export interface SessionRoom {
  [key: string]: any;
}

export interface Session {
  session_id: string;
  course_id: string;
  instructor_ldap: string;
  start_time: string;
  end_time: string;
  status: string;
  rooms: SessionRoom[];
}

export interface Attendance {
  student_ldap: string;
  timestamp: string;
  room_id: string;
  device_id: string;
  status: string;
}
