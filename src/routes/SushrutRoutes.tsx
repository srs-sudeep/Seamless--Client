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

const SushrutRoutes: RouteObject = {
  path: '/sushrut',
  element: <MainLayout />,
  children: [
    {
      path: 'empanelled-hospital',
      element: <CreateEmpanelledHospital />,
    },
    {
      path: 'create-student-reimbursment',
      element: <CreateReimbursment />,
    },
    {
      path: 'create-faculty-ipd',
      element: <CreateFacultyIPD />,
    },
    {
      path: 'create-faculty-opd',
      element: <CreateFacultyOPD />,
    },
  ],
};

export default SushrutRoutes;
