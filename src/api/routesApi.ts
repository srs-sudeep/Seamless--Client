import { apiClient } from '@/core/apiClient';
import { type UserRole } from '@/types';

// Interface for route access configuration
export interface RouteAccess {
  path: string;
  allowedRoles: UserRole[];
}
export interface UserRoute {
  path: string;
  is_active: boolean;
  module_id: number;
  id: number;
  role_ids: string[];
}

export const fetchUserRoutes = async (): Promise<string[]> => {
  const { data } = await apiClient.get<UserRoute[]>('/core/api/v1/routes/my-routes');
  return data.filter(route => route.is_active).map(route => route.path);
};
