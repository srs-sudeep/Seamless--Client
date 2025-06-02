import MainLayout from '@/layouts/MainLayout';
import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';

// Lazy load admin views
const UserManagement = lazy(() => import('@/views/admin/UserManagement'));
const SidebarManagement = lazy(() => import('@/views/admin/SidebarManagement'));
const SystemSettings = lazy(() => import('@/views/admin/SystemSettings'));
const PermissionManagement = lazy(() => import('@/views/admin/PermissionManagement'));
const AdminRoutes: RouteObject = {
  path: '/admin',
  element: <MainLayout />,
  children: [
    {
      path: 'users',
      element: <UserManagement />,
    },
    {
      path: 'sidebar',
      element: <SidebarManagement />,
    },
    {
      path: 'settings',
      element: <SystemSettings />,
    },
    {
      path: 'permission-management',
      element: <PermissionManagement />,
    },
  ],
};

export default AdminRoutes;
