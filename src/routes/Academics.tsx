import MainLayout from '@/layouts/MainLayout';
import lazyLoad from '@/lib/lazyLoad';
import { type RouteObject } from 'react-router-dom';

// Lazy load admin views
const RolesManagement = lazyLoad(() => import('@/views/admin/RolesManagement'));
const AcademicsRoutes: RouteObject = {
  path: '/academics',
  element: <MainLayout />,
  children: [
    {
      path: 'roles-management',
      element: <RolesManagement />,
    },
  ],
};

export default AcademicsRoutes;
