import { apiClient } from '@/core';
import type { CheckoutsResponse } from '@/types/gyankosh/checkout.types';

export const checkoutService = {
  getCheckouts: async (): Promise<CheckoutsResponse> => {
    const response = await apiClient.get('/gyankosha/api/v1/checkouts/checkouts');
    return response.data;
  },
};
export const checkoutMyService = {
  getCheckouts: async (): Promise<CheckoutsResponse> => {
    const response = await apiClient.get('/gyankosha/api/v1/checkouts/my-checkouts');
    return response.data;
  },
};
