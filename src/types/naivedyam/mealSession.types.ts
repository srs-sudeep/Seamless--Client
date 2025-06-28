export interface MealSession {
  id: string;
  transaction_type: string;
  vendor_id: string;
  time_start: string;
  time_end: string;
}

export interface MealSessionTransaction {
  meal_session_id: string;
  student_id: string;
  vendor_id: string;
  timestamp: string;
  transaction_id: string;
}

export interface StudentMealSessionTransaction {
  session_id: string;
  vendor_name: string;
  transaction_type: string;
  time_start: string;
  time_end: string;
  transaction_id: string;
  student_id: string;
  timestamp: string;
}
