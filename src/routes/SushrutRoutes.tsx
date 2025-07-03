import MainLayout from '@/layouts/MainLayout';
import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

// Lazy load admin views
const CreateEmpanelledHospital = lazy(() => import('@/views/sushrut/CreateEmpanelledHospital'));
const CreateFacultyIPD = lazy(() => import('@/views/sushrut/CreateFacultyIPD'));
const CreateFacultyOPD = lazy(() => import('@/views/sushrut/CreateFacultyOPD'));
// const Create= lazy(() => import('@/views/sushrut/Create'));
// const = lazy(() => import('@/views/sushrut/'));
// const = lazy(() => import('@/views/sushrut/'));
// const = lazy(() => import('@/views/sushrut/'));
// const = lazy(() => import('@/views/sushrut/'));
// const = lazy(() => import('@/views/sushrut/'));
// const = lazy(() => import('@/views/sushrut/'));
// const = lazy(() => import('@/views/sushrut/'));
// const = lazy(() => import('@/views/sushrut/'));
// const = lazy(() => import('@/views/sushrut/'));

const BodhikaRoutes: RouteObject = {
  path: '/bodhika',
  element: <MainLayout />,
  children: [
    {
      path: 'slots-management',
      element: <CreateEmpanelledHospital />,
    },
  ],
};

export default BodhikaRoutes;
