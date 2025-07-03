import { apiClient } from '@/core';
import type {
  GetTransactionsParams,
  MealSession,
  Transaction,
  TransactionFiltersResponse,
  TransactionListResponse,
} from '@/types';

// Transaction endpoints
const BASE = '/naivedyam/api/v1/transaction/';

export async function createTransaction(payload: Transaction): Promise<Transaction> {
  const { data } = await apiClient.post<Transaction>(BASE, payload, {
    silentError: false,
  });
  return data;
}

export async function getTransactionsByMealSession(
  params: GetTransactionsParams
): Promise<TransactionListResponse> {
  const {
    meal_session_id,
    meal_type,
    start_date,
    end_date,
    search,
    limit = 10,
    offset = 0,
  } = params;

  const query: Record<string, any> = { limit, offset };
  if (search) query.search = search;
  if (start_date) query.start_date = start_date;
  if (end_date) query.end_date = end_date;
  if (meal_type && meal_type.length > 0) {
    meal_type.forEach((type, idx) => {
      query[`meal_type[${idx}]`] = type;
    });
  }

  const paramsSerializer = (paramsObj: Record<string, any>) => {
    const usp = new URLSearchParams();
    Object.entries(paramsObj).forEach(([key, value]) => {
      if (key.startsWith('meal_type[')) {
        usp.append('meal_type', value as any);
      } else {
        usp.append(key, value as any);
      }
    });
    return usp.toString();
  };

  const { data } = await apiClient.get<TransactionListResponse>(
    `${BASE}meal-session/${meal_session_id}/transactions`,
    {
      params: query,
      paramsSerializer,
    }
  );
  return data;
}

export async function getTransactionFilters(): Promise<TransactionFiltersResponse> {
  const { data } = await apiClient.get<TransactionFiltersResponse>(`${BASE}filters`);
  return data;
}

// Meal session endpoints
export async function createMealSession(payload: MealSession): Promise<MealSession> {
  const { data } = await apiClient.post<MealSession>(`${BASE}meal-session`, payload, {
    silentError: false,
  });
  return data;
}

export async function stopMealSession(session_id: string): Promise<void> {
  await apiClient.put(
    `${BASE}meal-session/stop/${session_id}`,
    {},
    {
      silentError: false,
    }
  );
}

export async function getVendorMealSessions(): Promise<MealSession[]> {
  const { data } = await apiClient.get<MealSession[]>(`${BASE}meal-session/vendor`);
  return data;
}

export async function getActiveMealSessions(): Promise<MealSession[]> {
  const { data } = await apiClient.get<MealSession[]>(`${BASE}meal-session/active`);
  return data;
}
