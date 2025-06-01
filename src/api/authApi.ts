import { apiClient, publicApiClient } from '@/core/apiClient';

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

export const login = async (credentials: {
  ldapid: string;
  password: string;
}): Promise<LoginResponse> => {
  const response = await publicApiClient.post('/core/api/v1/auth/login', credentials);
  return response.data;
};

export const getMe = async (): Promise<MeResponse> => {
  const response = await apiClient.get('/core/api/v1/users/me');
  return response.data;
};
