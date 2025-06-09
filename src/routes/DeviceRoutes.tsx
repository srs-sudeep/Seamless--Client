import MainLayout from '@/layouts/MainLayout';
import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';

// Lazy load admin views
const DeviceAdminManagement = lazy(() => import('@/views/device/deviceAdmin'));
const DevicesManagement = lazy(() => import('@/views/device/devices'));
const AttendanceManagement = lazy(() => import('@/views/device/attendance'));
const DeviceRoutes: RouteObject = {
  path: '/device',
  element: <MainLayout />,
  children: [
    {
      path: 'device-admin',
      element: <DeviceAdminManagement />,
    },
    {
      path: 'devices',
      element: <DevicesManagement />,
    },
    {
      path: 'attendance',
      element: <AttendanceManagement />,
    },
  ],
};

export default DeviceRoutes;
