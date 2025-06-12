export interface CourseInstructor {
  instructor_ldap: string;
  instruction_type: string;
}

export interface Course {
  course_id: string;
  course_code: string;
  name: string;
  sem: string;
  slot_id: string;
  room_id: string;
  instructors: CourseInstructor[];
  students: string[];
}
