export interface UserRole {
  role_id: number;
  name: string;
  isAssigned: boolean;
}

export interface User {
  ldapid: string;
  idNumber: string;
  name: string;
  is_active: boolean;
  roles: UserRole[];
}
