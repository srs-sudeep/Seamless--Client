import { apiClient } from '@/core';
import type { InsuranceHospital, CreateInsuranceHospitalPayload } from '@/types';

const BASE = '/sushrut/api/v1/insurance-hospitals/';

export async function getInsuranceHospitals(): Promise<InsuranceHospital[]> {
  const { data } = await apiClient.get<InsuranceHospital[]>(BASE);
  return data;
}

export async function getInsuranceHospitalById(id: string): Promise<InsuranceHospital> {
  const { data } = await apiClient.get<InsuranceHospital>(`${BASE}${id}/`);
  return data;
}

export async function createInsuranceHospital(payload: CreateInsuranceHospitalPayload) {
  const { data } = await apiClient.post<InsuranceHospital>(BASE, payload, {
    silentError: false,
  });
  return data;
}
