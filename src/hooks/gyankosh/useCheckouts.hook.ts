import { useQuery } from '@tanstack/react-query';
import { checkoutService, checkoutMyService } from '@/api/gyankosh/checkout.api';

export const useCheckouts = () => {
  return useQuery({
    queryKey: ['checkouts'],
    queryFn: checkoutService.getCheckouts,
    staleTime: 2 * 60 * 1000,
  });
};
export const useMyCheckouts = () => {
  return useQuery({
    queryKey: ['checkouts'],
    queryFn: checkoutMyService.getCheckouts,
    staleTime: 2 * 60 * 1000,
  });
};
