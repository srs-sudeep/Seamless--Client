import { apiClient } from '@/core';
import type { PatronsResponse } from '@/types/gyankosh/patron.types';

export const patronService = {
  getPatrons: async (): Promise<PatronsResponse> => {
    const response = await apiClient.get('/gyankosha/api/v1/patrons/patrons');
    return response.data;
  },
};
