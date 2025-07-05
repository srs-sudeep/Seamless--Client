import { apiClient } from '@/core';
import type { BooksResponse } from '@/types/gyankosh/book.types';

export const bookService = {
  getBooks: async (): Promise<BooksResponse> => {
    const response = await apiClient.get('/gyankosha/api/v1/biblios/items');
    return response.data;
  },
};
