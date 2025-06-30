import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createTransaction,
  getTransactionsByMealSession,
  createMealSession,
  stopMealSession,
  getVendorMealSessions,
  getActiveMealSessions,
} from '@/api';
import type { Transaction, MealSessions } from '@/types';

// Transactions for a meal session
export function useTransactionsByMealSession(meal_session_id: string, enabled = true) {
  return useQuery<Transaction[]>({
    queryKey: ['transactions', meal_session_id],
    queryFn: () => getTransactionsByMealSession(meal_session_id),
    enabled: !!meal_session_id && enabled,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

// Meal session hooks
export function useCreateMealSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMealSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-sessions'] });
    },
  });
}

export function useStopMealSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: stopMealSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-sessions'] });
    },
  });
}

export function useVendorMealSessions() {
  return useQuery<MealSessions[]>({
    queryKey: ['meal-sessions', 'vendor'],
    queryFn: getVendorMealSessions,
  });
}

export function useActiveMealSessions() {
  return useQuery<MealSessions[]>({
    queryKey: ['meal-sessions', 'active'],
    queryFn: getActiveMealSessions,
  });
}
