import { apiClient } from '@/core/apiClient';
import { SidebarModuleItem } from '@/types';

/**
 * Fetches the sidebar modules for a given user role.
 *
 * @param {string} role - The role of the user.
 * @returns {Promise<SidebarModuleItem[]>} A promise that resolves to an array of sidebar module items.
 */

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
