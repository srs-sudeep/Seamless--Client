export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface MeResponse {
  name: string;
  idNumber: string;
  ldapid: string;
  is_active: boolean;
  roles: string[];
  created_at: string;
  updated_at: string;
}
