import MainLayout from '@/layouts/MainLayout';
import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';

// Lazy load admin views
const HostelManagement = lazy(() => import('@/views/chatravas/HostelList'));

const ChatravasRoutes: RouteObject = {
  path: '/chatravas',
  element: <MainLayout />,
  children: [
    {
      path: 'hostel-list',
      element: <HostelManagement />,
    },
  ],
};

export default ChatravasRoutes;
