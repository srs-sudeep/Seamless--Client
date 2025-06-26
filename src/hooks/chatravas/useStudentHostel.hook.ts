import {
  getStudentHostels,
  createStudentHostel,
  deleteStudentHostel,
} from '@/api/chatravas/studentHostel.api';
import type {
  GetStudentHostelsParams,
  StudentHostelListResponse,
  CreateStudentHostelDto,
  DeleteStudentHostelDto,
} from '@/types/chatravas/studentHostel.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useStudentHostels(params: GetStudentHostelsParams = {}) {
  return useQuery<StudentHostelListResponse>({
    queryKey: ['student_hostels', params],
    queryFn: () => getStudentHostels(params),
  });
}

export function useCreateStudentHostel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStudentHostelDto) => createStudentHostel(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student_hostels'] });
    },
  });
}

export function useDeleteStudentHostel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: DeleteStudentHostelDto }) =>
      deleteStudentHostel(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student_hostels'] });
    },
  });
}
