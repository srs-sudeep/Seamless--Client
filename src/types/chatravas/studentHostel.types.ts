export interface StudentHostel {
  id: number;
  hostel_id: string;
  student_id: string;
  start_date: string;
  end_date: string;
  is_deleted: boolean;
}

export interface GetStudentHostelsParams {
  is_deleted?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface StudentHostelListResponse {
  total_count: number;
  student_hostels: StudentHostel[];
}

export interface CreateStudentHostelDto {
  hostel_id: string;
  student_id: string;
  start_date: string;
  end_date?: string;
}

export interface DeleteStudentHostelDto {
  end_date?: string;
  is_deleted: boolean;
}
