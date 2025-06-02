import { apiClient } from '@/core/apiClient';

export interface SidebarSubModuleTreeItem {
  id: string;
  label: string;
  path?: string;
  icon?: string;
  isActive: boolean;
  children?: SidebarSubModuleTreeItem[];
}

export interface SidebarModuleItem {
  id: string;
  label: string;
  icon?: string;
  isActive: boolean;
  subModules: SidebarSubModuleTreeItem[];
}

export const fetchSidebarModules = async (role: string): Promise<SidebarModuleItem[]> => {
  try {
    const { data } = await apiClient.get<SidebarModuleItem[]>(
      `/core/api/v1/sidebar/sidebar?role=${encodeURIComponent(role)}`
    );
    return data;
  } catch (error) {
    return [];
  }
};
