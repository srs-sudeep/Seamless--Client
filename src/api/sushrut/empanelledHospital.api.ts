import { apiClient } from '@/core';
import type { EmpanelledHospital, CreateEmpanelledHospitalPayload } from '@/types';

const BASE = '/sushrut/api/v1/empanelled-hospital/';

export async function getEmpanelledHospitals(): Promise<EmpanelledHospital[]> {
  const { data } = await apiClient.get<EmpanelledHospital[]>(BASE);
  return data;
}

export async function getEmpanelledHospitalById(id: string): Promise<EmpanelledHospital> {
  const { data } = await apiClient.get<EmpanelledHospital>(`${BASE}${id}/`);
  return data;
}

export async function createEmpanelledHospital(payload: CreateEmpanelledHospitalPayload) {
  const { data } = await apiClient.post<EmpanelledHospital>(BASE, payload, {
    silentError: false,
  });
  return data;
}
