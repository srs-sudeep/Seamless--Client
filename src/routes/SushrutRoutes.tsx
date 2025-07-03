import MainLayout from '@/layouts/MainLayout';
import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';

// Lazy load admin views
const CreateEmpanelledHospital = lazy(() => import('@/views/sushrut/CreateEmpanelledHospital'));
const CreateFacultyIPD = lazy(() => import('@/views/sushrut/CreateFacultyIPD'));
const CreateFacultyOPD = lazy(() => import('@/views/sushrut/CreateFacultyOPD'));
const CreateReimbursment = lazy(() => import('@/views/sushrut/CreateReimbursement'));
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
  path: '/sushrut',
  element: <MainLayout />,
  children: [
    {
      path: '/empanelled-hospital',
      element: <CreateEmpanelledHospital />,
    },
    {
      path: '/student-reimbursment',
      element: <CreateReimbursment />,
    },
    {
      path: '/faculty-ipd',
      element: <CreateFacultyIPD />,
    },
    {
      path: '/faculty-opd',
      element: <CreateFacultyOPD />,
    },
  ],
};

export default BodhikaRoutes;
