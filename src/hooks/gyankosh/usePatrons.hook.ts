import { useQuery } from '@tanstack/react-query';
import { patronService } from '@/api/gyankosh/patron.api';

export const usePatrons = () => {
  return useQuery({
    queryKey: ['patrons'],
    queryFn: patronService.getPatrons,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
