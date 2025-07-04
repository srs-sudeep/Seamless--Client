import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdditionalInfo,
  getAdditionalInfoByID,
  CreateAdditionalInfo,
} from '@/api/sushrut/additonalInfo.api';
import type { AdditionalInfo } from '@/types/sushrut/additionalInfo.types';

export function useAdditionalInfos() {
  return useQuery<AdditionalInfo[]>({
    queryKey: ['additional-infos'],
    queryFn: getAdditionalInfo,
  });
}

export function useAdditionalInfo(id: string) {
  return useQuery<AdditionalInfo>({
    queryKey: ['additional-info', id],
    queryFn: () => getAdditionalInfoByID(id),
    enabled: !!id,
  });
}

export function useCreateAdditionalInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: CreateAdditionalInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['additional-infos'] });
    },
  });
}
