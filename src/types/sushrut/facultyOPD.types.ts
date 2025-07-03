export interface ClaimantOPD {
  claimant_name: string;
  employee_code: string;
  designation: string;
  telephone: string;
  department: string;
  email: string;
  ward_entitlement: string;
  pay_band_grade: string;
}

export interface PatientOPD {
  patient_name: string;
  patient_id: string;
  relationship_to_claimant: string;
  illness_nature: string;
  referring_ama: string;
  treated_hospital: string;
}

export interface FacultyOPD {
  total_claim_submitted: number;
  total_enclosures: number;
  advance_taken: number;
  total_amount_recommended: number;
  declaration_date: string;
}

export interface HospitalExpenseOPD {
  id?: string;
  expense_type: string;
  amount: number;
  date: string;
  description: string;
  receipt_number?: string;
  hospital_name?: string;
}

export interface FacultyOPDClaim {
  id?: string;
  claimant: ClaimantOPD;
  patient: PatientOPD;
  faculty_opd: FacultyOPD;
  hospital_expenses: HospitalExpenseOPD[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateFacultyOPDClaimPayload {
  claimant: ClaimantOPD;
  patient: PatientOPD;
  faculty_opd: FacultyOPD;
  hospital_expenses: HospitalExpenseOPD[];
}

export interface UpdateFacultyOPDClaimPayload {
  claimant?: Partial<ClaimantOPD>;
  patient?: Partial<PatientOPD>;
  faculty_opd?: Partial<FacultyOPD>;
  hospital_expenses?: HospitalExpenseOPD[];
}
