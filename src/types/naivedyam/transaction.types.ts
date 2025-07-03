export interface Transaction {
  meal_session_id: string;
  student_id: string;
  vendor_id: string;
  timestamp: string;
  transaction_id: string;
}

export interface MealSessions {
  transaction_type: string; // e.g. "breakfast"
  id: string;
  vendor_id: string;
  time_start: string;
  time_end: string;
}

// Add to your transaction types file
export interface TransactionFiltersResponse {
  meal_types: Array<{
    label: string;
    value: string;
  }>;
  date_range: {
    min_date: string;
    max_date: string;
  };
}

export interface GetTransactionsParams {
  meal_session_id: string;
  meal_type?: string[];
  start_date?: string;
  end_date?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  total_count: number;
}
