export interface GuestUser {
  ldapid: string;
  idNumber: string;
  name: string;
  is_active: boolean;
  roles: string[];
  password: string;
}

export interface Doctor {
  id?: string;
  ldapid: string;
  email: string;
  name: string;
  department: string;
  is_active: boolean;
  guest_user: GuestUser;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDoctorPayload {
  ldapid: string;
  email: string;
  department: string;
  is_active: boolean;
  guest_user: GuestUser;
}

export interface UpdateDoctorPayload {
  ldapid?: string;
  email?: string;
  department?: string;
  is_active?: boolean;
  guest_user?: Partial<GuestUser>;
}

export interface Slot {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
}

export interface DoctorSlotPayload {
  ldapid: string;
  slot_ids: number[];
}
