export interface UserRoleAPI {
  role_id: number;
  name: string;
  isAssigned: boolean;
}

export interface UserAPI {
  ldapid: string;
  idNumber: string;
  name: string;
  is_active: boolean;
  roles: UserRoleAPI[];
}
