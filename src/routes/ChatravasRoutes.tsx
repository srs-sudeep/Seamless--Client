import MainLayout from '@/layouts/MainLayout';
import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';

// Lazy load admin views
const HostelManagement = lazy(() => import('@/views/chatravas/HostelList'));
const StudentHostel = lazy(() => import('@/views/chatravas/StudentHostel'));
const Attendance = lazy(() => import('@/views/chatravas/Attendance'));

const ChatravasRoutes: RouteObject = {
  path: '/chatravas',
  element: <MainLayout />,
  children: [
    {
      path: 'hostel-list',
      element: <HostelManagement />,
    },
    {
      path: 'student-hostel',
      element: <StudentHostel />,
    },
    {
      path: 'attendance',
      element: <Attendance />,
    },
  ],
};

export default ChatravasRoutes;
