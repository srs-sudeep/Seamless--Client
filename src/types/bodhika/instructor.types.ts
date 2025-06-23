export type InstructionType = 'Lecture' | 'Tutorial' | 'Lab' | string;

export interface Instructor {
  instructor_ldap: string;
  course_id: string;
  instruction_type: InstructionType;
}

export interface InstructorFiltersResponse {
  course_codes: string[];
  instruction_types: string[];
  sems: string[];
}

export interface GetInstructorsParams {
  search?: string;
  course_code?: string;
  sem?: string;
  instruction_type?: string;
  page?: number;
  page_size?: number;
}

export interface InstructorListResponse {
  total: number;
  page: number;
  page_size: number;
  results: Instructor[];
}
