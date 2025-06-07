import MainLayout from '@/layouts/MainLayout';
import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';

// Lazy load admin views
const RolesManagement = lazy(() => import('@/views/admin/RolesManagement'));
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
