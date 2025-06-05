import { fetchSidebarModules } from '@/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery } from '@tanstack/react-query';

export function useSidebarItems() {
  const { currentRole } = useAuthStore();
  const { data: sidebarItems = [], isLoading } = useQuery({
    queryKey: ['sidebarItems', currentRole],
    queryFn: () => fetchSidebarModules(currentRole ?? ''),
    enabled: !!currentRole,
  });

  return { sidebarItems, isLoading };
}
