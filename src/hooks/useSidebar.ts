import { fetchSidebarModules } from '@/api/sidebarApi';
import { useQuery } from '@tanstack/react-query';

export function useSidebarItems() {
  const { data: sidebarItems = [], isLoading } = useQuery({
    queryKey: ['sidebarItems'],
    queryFn: fetchSidebarModules,
  });
  return { sidebarItems, isLoading };
}
