import { apiClient } from '@/core';
import type {
  DoctorSlots,
  CreateAppointmentPayload,
  Appointment,
  ExistingAppointment,
} from '@/types/sushrut/appointment.types';

const DOCTOR_BASE = '/sushrut/api/v1/doctor/';
const APPOINTMENT_BASE = '/sushrut/api/v1/appointment/';

export async function getDoctorSlots(ldapid: string): Promise<DoctorSlots> {
  const { data } = await apiClient.get<DoctorSlots>(`${DOCTOR_BASE}doctor-slot/${ldapid}`);
  return data;
}

export async function getAppointmentsByDoctor(ldapid: string): Promise<ExistingAppointment[]> {
  const { data } = await apiClient.get<ExistingAppointment[]>(
    `${APPOINTMENT_BASE}by-doctor/${ldapid}`
  );
  return data;
}

export async function createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
  const { data } = await apiClient.post<Appointment>(APPOINTMENT_BASE, payload, {
    silentError: false,
  });
  return data;
}
