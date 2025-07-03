import {
  createMealSession,
  createTransaction,
  getActiveMealSessions,
  getTransactionFilters,
  getTransactionsByMealSession,
  getVendorMealSessions,
  stopMealSession,
} from '@/api';
import type {
  GetTransactionsParams,
  MealSessions,
  TransactionFiltersResponse,
  TransactionListResponse,
} from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Transactions for a meal session with filters
export function useTransactionsByMealSession(params: GetTransactionsParams, enabled = true) {
  return useQuery<TransactionListResponse>({
    queryKey: ['transactions', params.meal_session_id, params],
    queryFn: () => getTransactionsByMealSession(params),
    enabled: !!params.meal_session_id && enabled,
  });
}

export function useTransactionFilters() {
  return useQuery<TransactionFiltersResponse>({
    queryKey: ['transaction-filters'],
    queryFn: getTransactionFilters,
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
