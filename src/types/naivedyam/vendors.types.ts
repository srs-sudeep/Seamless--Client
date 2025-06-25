export interface Vendor {
  ldapid: string;
  email: string;
  address: string;
  description: string;
  is_active: boolean;
  guest_user: {
    ldapid: string;
    idNumber: string;
    name: string;
    is_active: boolean;
    roles: string[];
    password: string;
  };
}
