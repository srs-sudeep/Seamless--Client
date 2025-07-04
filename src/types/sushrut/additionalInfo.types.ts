export interface AdditionalInfo {
  id?: string;
  title?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAdditionalInfoPayload {
  title?: string;
  description?: string;
}
