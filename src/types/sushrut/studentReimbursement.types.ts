export interface Students {
  student_name: string;
  age: number;
  student_id: string;
  course_program: string;
  reference_ama: string;
  contact_no: string;
}

export interface Patient {
  illness_diagnosis: string;
  treatment_from: string;
  treatment_to: string;
}

export interface BankDetails {
  bank_account_no: string;
  ifsc_code: string;
  bank_name: string;
  branch_name: string;
}

export interface Reimbursement {
  total_claim_submitted: number;
  total_enclosures: number;
  advance_taken: number;
  total_amount_recommended: number;
  total_amount: number;
  register_no: string;
  serial_no: string;
}

export interface Expense {
  id?: string;
  expense_type: string;
  amount: number;
  date: string;
  description: string;
  receipt_number?: string;
}

export interface StudentReimbursement {
  id?: string;
  student: Students;
  patient: Patient;
  bank_details: BankDetails;
  reimbursement: Reimbursement;
  expenses: Expense[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateStudentReimbursementPayload {
  student: Students;
  patient: Patient;
  bank_details: BankDetails;
  reimbursement: Reimbursement;
  expenses: Expense[];
}

export interface UpdateStudentReimbursementPayload {
  student?: Partial<Students>;
  patient?: Partial<Patient>;
  bank_details?: Partial<BankDetails>;
  reimbursement?: Partial<Reimbursement>;
  expenses?: Expense[];
}
