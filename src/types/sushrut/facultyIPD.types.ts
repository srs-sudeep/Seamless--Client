export interface Claimant {
  claimant_name: string;
  employee_code: string;
  designation: string;
  telephone: string;
  department: string;
  email: string;
  ward_entitlement: string;
  pay_band_grade: string;
}

export interface Patients {
  patient_name: string;
  relationship_to_claimant: string;
  illness_description: string;
  illness_period: string;
  referring_ama: string;
  referring_date: string;
  referred_hospital: string;
}

export interface FacultyIPD {
  total_claim_submitted: number;
  total_enclosures: number;
  advance_taken: number;
  total_amount_recommended: number;
  declaration_date: string;
}

export interface HospitalExpenses {
  // Claimed amounts
  accommodation_claimed: number;
  registration_fee_claimed: number;
  consultation_claimed: number;
  surgeon_charges_claimed: number;
  nursing_charges_claimed: number;
  ot_charges_claimed: number;
  xray_claimed: number;
  hospital_charges_claimed: number;
  physiotherapy_claimed: number;
  blood_charges_claimed: number;
  test_procedure_claimed: number;
  angioplasty_claimed: number;
  medicine_claimed: number;
  market_medicine_claimed: number;
  imaging_claimed: number;
  diagnostic_claimed: number;
  ecg_claimed: number;
  consumables_claimed: number;
  other_charges_claimed: number;
  miscellaneous_claimed: number;

  // Recommended amounts
  accommodation_recommended: number;
  registration_fee_recommended: number;
  consultation_recommended: number;
  surgeon_charges_recommended: number;
  nursing_charges_recommended: number;
  ot_charges_recommended: number;
  xray_recommended: number;
  hospital_charges_recommended: number;
  physiotherapy_recommended: number;
  blood_charges_recommended: number;
  test_procedure_recommended: number;
  angioplasty_recommended: number;
  medicine_recommended: number;
  market_medicine_recommended: number;
  imaging_recommended: number;
  diagnostic_recommended: number;
  ecg_recommended: number;
  consumables_recommended: number;
  other_charges_recommended: number;
  miscellaneous_recommended: number;

  // Totals
  total_claimed_amount: number;
  total_recommended_amount: number;
}

export interface FacultyIPDClaim {
  id?: string;
  claimant: Claimant;
  patient: Patients;
  faculty_ipd: FacultyIPD;
  hospital_expenses: HospitalExpenses;
  created_at?: string;
  updated_at?: string;
}

export interface CreateFacultyIPDPayload {
  claimant: Claimant;
  patient: Patients;
  faculty_ipd: FacultyIPD;
  hospital_expenses: HospitalExpenses;
}

export interface UpdateFacultyIPDPayload {
  claimant?: Partial<Claimant>;
  patient?: Partial<Patients>;
  faculty_ipd?: Partial<FacultyIPD>;
  hospital_expenses?: Partial<HospitalExpenses>;
}
