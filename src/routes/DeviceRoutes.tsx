import MainLayout from '@/layouts/MainLayout';
import lazyLoad from '@/lib/lazyLoad';
import { type RouteObject } from 'react-router-dom';

// Lazy load device views
const DeviceAdminManagement = lazyLoad(() => import('@/views/device/deviceAdmin'));
const DevicesManagement = lazyLoad(() => import('@/views/device/devices'));
const AttendanceManagement = lazyLoad(() => import('@/views/device/attendance'));
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
