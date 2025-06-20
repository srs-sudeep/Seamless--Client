export interface CourseSlotRoom {
  slot_id: string;
  room_id: string[]; // Always an array of strings
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
