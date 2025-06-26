export interface Hostel {
  hostel_id: string;
  hostel_name: string;
  hostel_ldap: string;
  incharge: string;
}

export interface GetHostelsParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export interface HostelListResponse {
  total_count: number;
  hostels: Hostel[];
}

export interface CreateHostelDto {
  hostel_name: string;
  hostel_ldap: string;
  incharge: string;
}

export interface UpdateHostelDto {
  hostel_name?: string;
  hostel_ldap?: string;
  incharge?: string;
}
