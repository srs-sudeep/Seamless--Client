import { apiClient } from '@/core/apiClient';
import { SidebarModuleItem } from '@/types';

/**
 * Fetches the sidebar modules for a given user role.
 *
 * @param {string} role - The role of the user.
 * @returns {Promise<SidebarModuleItem[]>} A promise that resolves to an array of sidebar module items.
 */

export const fetchSidebarModules = async (
  role: string,
  is_active?: boolean
): Promise<SidebarModuleItem[]> => {
  let url = `/core/api/v1/sidebar/sidebar?role=${encodeURIComponent(role)}`;
  if (typeof is_active === 'boolean') {
    url += `&is_active=${is_active}`;
  }
  const { data } = await apiClient.get<SidebarModuleItem[]>(url, {
    silentError: false,
    headers: {
      'x-error-context': 'Fetching Sidebar Modules',
    },
  });
  return data;
};
