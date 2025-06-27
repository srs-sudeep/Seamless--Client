import {
  createHostel,
  deleteHostel,
  getHostelById,
  getHostels,
  updateHostel,
} from '@/api/chatravas/hostel.api';
import type {
  CreateHostelDto,
  GetHostelsParams,
  Hostel,
  HostelListResponse,
  UpdateHostelDto,
} from '@/types/chatravas/hostel.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useHostels(params: GetHostelsParams = {}) {
  return useQuery<HostelListResponse>({
    queryKey: ['hostels', params],
    queryFn: () => getHostels(params),
  });
}

export function useHostel(hostel_id: string) {
  return useQuery<Hostel>({
    queryKey: ['hostel', hostel_id],
    queryFn: () => getHostelById(hostel_id),
    enabled: !!hostel_id,
  });
}

export function useCreateHostel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateHostelDto) => createHostel(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostels'] });
    },
  });
}

export function useUpdateHostel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ hostel_id, payload }: { hostel_id: string; payload: UpdateHostelDto }) =>
      updateHostel(hostel_id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostels'] });
    },
  });
}

export function useDeleteHostel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (hostel_id: string) => deleteHostel(hostel_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostels'] });
    },
  });
}
