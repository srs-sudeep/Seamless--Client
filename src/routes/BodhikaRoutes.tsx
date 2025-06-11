import MainLayout from '@/layouts/MainLayout';
import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';

// Lazy load admin views
const SlotsManagement = lazy(() => import('@/views/bodhika/slotsManagement'));
const BodhikaRoutes: RouteObject = {
  path: '/bodhika',
  element: <MainLayout />,
  children: [
    {
      path: 'slots-management',
      element: <SlotsManagement />,
    },
  ],
};

export default BodhikaRoutes;
