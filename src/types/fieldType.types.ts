export type FieldType = {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[] | { value: string; label: string }[];
  columns?: number;
  placeholder?: string;
  disabled?: boolean;
  multiSelect?: boolean;
};
