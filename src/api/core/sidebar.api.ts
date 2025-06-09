import { apiClient } from '@/core';
import { SidebarModuleItem } from '@/types';

/**
 * Fetches the sidebar modules for a given user role.
 *
 * @param {string} role - The role of the user.
 * @returns {Promise<SidebarModuleItem[]>} A promise that resolves to an array of sidebar module items.
 */

export const fetchSidebarModules = async (
  params: { role?: string; is_active?: boolean } = {}
): Promise<SidebarModuleItem[]> => {
  const searchParams = new URLSearchParams();
  if (params.role) searchParams.append('role', params.role);
  if (typeof params.is_active === 'boolean')
    searchParams.append('is_active', String(params.is_active));

  const { data } = await apiClient.get<SidebarModuleItem[]>(
    `/core/api/v1/sidebar/sidebar${searchParams.toString() ? `?${searchParams}` : ''}`,
    {
      silentError: true,
      headers: {
        'x-error-context': 'Fetching Sidebar Modules',
      },
    }
  );
  return data;
};
