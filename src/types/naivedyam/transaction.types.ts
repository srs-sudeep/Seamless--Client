export interface Transaction {
  meal_session_id: string;
  student_id: string;
  vendor_id: string;
  timestamp: string;
  transaction_id: string;
}

export interface MealSession {
  transaction_type: string; // e.g. "breakfast"
  id: string;
  vendor_id: string;
  time_start: string;
  time_end: string;
}
