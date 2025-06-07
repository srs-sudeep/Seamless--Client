import { fetchSidebarModules } from '@/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery } from '@tanstack/react-query';

export function useSidebarItems(is_active?: boolean) {
  const { currentRole } = useAuthStore();
  const { data: sidebarItems = [], isLoading } = useQuery({
    queryKey: ['sidebarItems', currentRole, is_active],
    queryFn: () => fetchSidebarModules(currentRole ?? '', is_active),
    enabled: !!currentRole,
  });

  return { sidebarItems, isLoading };
}
