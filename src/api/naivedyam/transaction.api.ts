import { apiClient } from '@/core';
import type { Transaction, MealSession } from '@/types/naivedyam/transaction.types';

// Transaction endpoints
const BASE = '/naivedyam/api/v1/transaction/';

export async function createTransaction(payload: Transaction): Promise<Transaction> {
  const { data } = await apiClient.post<Transaction>(BASE, payload);
  return data;
}

export async function getTransactionsByMealSession(
  meal_session_id: string
): Promise<Transaction[]> {
  const { data } = await apiClient.get<Transaction[]>(
    `${BASE}meal-session/${meal_session_id}/transactions`
  );
  return data;
}

// Meal session endpoints
export async function createMealSession(payload: MealSession): Promise<MealSession> {
  const { data } = await apiClient.post<MealSession>(`${BASE}meal-session`, payload);
  return data;
}

export async function stopMealSession(session_id: string): Promise<void> {
  await apiClient.put(`${BASE}meal-session/stop/${session_id}`);
}

export async function getVendorMealSessions(): Promise<MealSession[]> {
  const { data } = await apiClient.get<MealSession[]>(`${BASE}meal-session/vendor`);
  return data;
}

export async function getActiveMealSessions(): Promise<MealSession[]> {
  const { data } = await apiClient.get<MealSession[]>(`${BASE}meal-session/active`);
  return data;
}
