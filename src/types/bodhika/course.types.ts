export interface CourseSlotRoom {
  slot_id: string;
  room_id: string[];
}

export interface CourseInstructor {
  instructor_ldap: string;
  instruction_type: string;
}

export interface Course {
  course_id: string;
  course_code: string;
  name: string;
  sem: string;
  slot_room_id: CourseSlotRoom[];
  instructors: CourseInstructor[];
  students?: string[];
}

export interface GetCoursesParams {
  search?: string;
  semester?: string;
  rooms?: string[];
  limit?: number;
  offset?: number;
}

export interface CourseListResponse {
  total: number;
  page: number;
  page_size: number;
  results: Course[];
}
