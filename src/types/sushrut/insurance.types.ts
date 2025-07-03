export interface Insurance {
  id?: string;
  session_year: string;
  medical_claim_policy_no: string;
  accidental_claim_policy_no: string;
  period_of_insurance: string;
  insurance_company: string;
  policy_number: string;
  policy_holder_name: string;
  coverage_amount: number;
  policy_start_date: string;
  policy_end_date: string;
  policy_status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'PENDING' | 'CANCELLED';
  created_at?: string;
  updated_at?: string;
}

export interface CreateInsurancePayload {
  session_year: string;
  medical_claim_policy_no: string;
  accidental_claim_policy_no: string;
  period_of_insurance: string;
  insurance_company: string;
  policy_number: string;
  policy_holder_name: string;
  coverage_amount: number;
  policy_start_date: string;
  policy_end_date: string;
  policy_status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'PENDING' | 'CANCELLED';
}

export interface UpdateInsurancePayload {
  session_year?: string;
  medical_claim_policy_no?: string;
  accidental_claim_policy_no?: string;
  period_of_insurance?: string;
  insurance_company?: string;
  policy_number?: string;
  policy_holder_name?: string;
  coverage_amount?: number;
  policy_start_date?: string;
  policy_end_date?: string;
  policy_status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'PENDING' | 'CANCELLED';
}
