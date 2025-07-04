export interface AppointmentSlot {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  is_booked?: boolean;
}

export interface DoctorSlots {
  ldapid: string;
  slots: AppointmentSlot[];
}

export interface CreateAppointmentPayload {
  doctor_ldap: string;
  patient_type: string;
  slot_id: number;
  patient_relationship: string;
}

export interface Appointment {
  id?: string;
  doctor_ldap: string;
  patient_type: string;
  slot_id: number;
  patient_relationship: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExistingAppointment {
  doctor_ldap: string;
  patient_type: string;
  slot_id: number;
  patient_relationship: string;
  id: number;
  patient_ldap: string;
}
