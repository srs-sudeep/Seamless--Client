import { apiClient } from '@/core';
import type {
  Doctor,
  CreateDoctorPayload,
  Slot,
  DoctorSlotPayload,
} from '@/types/sushrut/doctor.types';

const BASE = '/sushrut/api/v1/doctor/';
const SLOTS_BASE = '/sushrut/api/v1/slots/';

export async function getDoctors(): Promise<Doctor[]> {
  const { data } = await apiClient.get<Doctor[]>(BASE);
  return data;
}

export async function getDoctorById(id: string): Promise<Doctor> {
  const { data } = await apiClient.get<Doctor>(`${BASE}${id}/`);
  return data;
}

export async function createDoctor(payload: CreateDoctorPayload) {
  const { data } = await apiClient.post<Doctor>(BASE, payload, {
    silentError: false,
  });
  return data;
}

export async function getSlots(): Promise<Slot[]> {
  const { data } = await apiClient.get<Slot[]>(SLOTS_BASE);
  return data;
}

export async function assignDoctorSlots(payload: DoctorSlotPayload) {
  const { data } = await apiClient.post(`${BASE}doctor-slot/`, payload, {
    silentError: false,
  });
  return data;
}
