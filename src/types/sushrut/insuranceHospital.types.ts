export interface InsuranceHospital {
  id?: string;
  hospital_name: string;
  tpa: string;
  authorised_person: string;
  contact_no: string;
  email: string;
  medical_claim_sum_insured: number;
  accidental_claim_sum_insured: number;
  accidental_death_or_permanent_disability: number;
  loss_of_laptop: number;
  damage_or_loss_of_baggage: number;
  buffer_amount: number;
  ward_entitle: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface CreateInsuranceHospitalPayload {
  hospital_name: string;
  tpa: string;
  authorised_person: string;
  contact_no: string;
  email: string;
  medical_claim_sum_insured: number;
  accidental_claim_sum_insured: number;
  accidental_death_or_permanent_disability: number;
  loss_of_laptop: number;
  damage_or_loss_of_baggage: number;
  buffer_amount: number;
  ward_entitle: string;
}

export interface UpdateInsuranceHospitalPayload {
  hospital_name?: string;
  tpa?: string;
  authorised_person?: string;
  contact_no?: string;
  email?: string;
  medical_claim_sum_insured?: number;
  accidental_claim_sum_insured?: number;
  accidental_death_or_permanent_disability?: number;
  loss_of_laptop?: number;
  damage_or_loss_of_baggage?: number;
  buffer_amount?: number;
  ward_entitle?: string;
  is_active?: boolean;
}
