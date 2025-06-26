import { getStudentVendors } from '@/api/naivedyam/studentVendor.api';
import { StudentVendor } from '@/types';
import { useQuery } from '@tanstack/react-query';

export function useStudentVendors() {
  return useQuery<StudentVendor[]>({
    queryKey: ['student-vendors'],
    queryFn: getStudentVendors,
  });
}
