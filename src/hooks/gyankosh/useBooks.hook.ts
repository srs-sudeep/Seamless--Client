import { useQuery } from '@tanstack/react-query';
import { bookService } from '@/api/gyankosh/book.api';

export const useBooks = () => {
  return useQuery({
    queryKey: ['books'],
    queryFn: bookService.getBooks,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
