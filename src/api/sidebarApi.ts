import { apiClient } from '@/core/apiClient';
import { SidebarModuleItem } from '@/types';

export const fetchSidebarModules = async (role: string): Promise<SidebarModuleItem[]> => {
  const { data } = await apiClient.get<SidebarModuleItem[]>(
    `/core/api/v1/sidebar/sidebar?role=${encodeURIComponent(role)}`,
    {
      silentError: false,
      headers: {
        'x-error-context': 'Fetching Sidebar Modules',
      },
    }
  );
  return data;
};
