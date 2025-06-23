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
  sem?: string;
  slot_id?: string;
  room_id?: string;
  course_code?: string;
  page?: number;
  page_size?: number;
}

export interface CourseListResponse {
  total: number;
  page: number;
  page_size: number;
  results: Course[];
}

export interface CourseSlot {
  slot_id: string;
  time: string;
  day: string;
}
export interface CourseRoom {
  room_id: string;
  room_name: string;
}
export interface CourseFiltersResponse {
  course_codes: string[];
  slots: CourseSlot[];
  rooms: CourseRoom[];
  courses: {
    course_id: string;
    course_code: string;
    name: string;
    sem: string;
  }[];
  sems: string[];
}
