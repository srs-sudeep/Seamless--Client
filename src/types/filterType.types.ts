export interface FilterConfig {
  type: 'search' | 'dropdown' | 'multi-select' | 'date' | 'date-range' | 'datetime';
  column: string;
  options?: string[];
}
