import {
  getAllMealSessions,
  getMealSessionTransactions,
  getStudentMealSessionTransactions,
  getVendorMealSessions,
} from '@/api';
import type { MealSession, MealSessionTransaction, StudentMealSessionTransaction } from '@/types';
import { useQuery } from '@tanstack/react-query';

export function useMealSessions() {
  return useQuery<MealSession[]>({
    queryKey: ['mealSessions'],
    queryFn: getAllMealSessions,
  });
}

export function useVendorMealSession() {
  return useQuery<MealSession[]>({
    queryKey: ['vendorMealSessions'],
    queryFn: getVendorMealSessions,
  });
}

export function useMealSessionTransactions(mealSessionId: string) {
  return useQuery<MealSessionTransaction[]>({
    queryKey: ['mealSessionTransactions', mealSessionId],
    queryFn: () => getMealSessionTransactions(mealSessionId),
    enabled: !!mealSessionId,
  });
}

export function useStudentMealSessionTransactions() {
  return useQuery<StudentMealSessionTransaction[]>({
    queryKey: ['studentMealSessionTransactions'],
    queryFn: getStudentMealSessionTransactions,
  });
}
