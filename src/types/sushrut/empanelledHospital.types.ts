export interface EmpanelledHospital {
  id?: string;
  hospital_name: string;
  address: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEmpanelledHospitalPayload {
  hospital_name: string;
  address: string;
}
