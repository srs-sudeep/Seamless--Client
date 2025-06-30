import { apiClient } from '@/core';
import type { MealSession, MealSessionTransaction, StudentMealSessionTransaction } from '@/types';

export async function getAllMealSessions(): Promise<MealSession[]> {
  const { data } = await apiClient.get<MealSession[]>(
    '/naivedyam/api/v1/transaction/meal-session/all'
  );
  return data;
}

export async function getVendorMealSession(): Promise<MealSession[]> {
  const { data } = await apiClient.get<MealSession[]>(
    '/naivedyam/api/v1/transaction/meal-session/vendor'
  );
  return data;
}

export async function getMealSessionTransactions(
  meal_session_id: string
): Promise<MealSessionTransaction[]> {
  const { data } = await apiClient.get<MealSessionTransaction[]>(
    `/naivedyam/api/v1/transaction/meal-session/${meal_session_id}/transactions`
  );
  return data;
}

export async function getStudentMealSessionTransactions(): Promise<
  StudentMealSessionTransaction[]
> {
  const { data } = await apiClient.get<StudentMealSessionTransaction[]>(
    '/naivedyam/api/v1/transaction/meal-session/student'
  );
  return data;
}
