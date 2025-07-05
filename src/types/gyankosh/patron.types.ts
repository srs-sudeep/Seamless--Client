export interface PatronAddress {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Patron {
  patron_id: number;
  cardnumber: string;
  name: string;
  ldap_id: string;
  phone_number: string;
  email: string;
  overdues_count: number;
  has_potential_fines: boolean;
  status: string;
  category: string;
  library: string;
  expiry_date: string;
  last_seen: string | null;
  date_enrolled: string | null;
  address: PatronAddress;
  notes: string;
}

export type PatronsResponse = Patron[];
