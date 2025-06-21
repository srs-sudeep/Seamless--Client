export interface FilterConfig {
  column: string;
  type: 'search' | 'dropdown' | 'multi-select' | 'date' | 'date-range' | 'datetime';
  options?: string[];
  value?: any;
  onChange?: (val: any) => void;
}
