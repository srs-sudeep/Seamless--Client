export type InstructionType = 'Lecture' | 'Tutorial' | 'Lab';

export interface Instructor {
  instructor_ldap: string;
  course_id: string;
  instruction_type: InstructionType[];
}
