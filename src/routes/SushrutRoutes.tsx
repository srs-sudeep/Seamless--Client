import MainLayout from '@/layouts/MainLayout';
import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';

// Lazy load admin views
const CreateEmpanelledHospital = lazy(() => import('@/views/sushrut/CreateEmpanelledHospital'));
const CreateFacultyIPD = lazy(() => import('@/views/sushrut/CreateFacultyIPD'));
const CreateFacultyOPD = lazy(() => import('@/views/sushrut/CreateFacultyOPD'));
const CreateReimbursment = lazy(() => import('@/views/sushrut/CreateReimbursement'));
const CreateInsurance = lazy(() => import('@/views/sushrut/CreateInsurance'));
const FacultyIPDList = lazy(() => import('@/views/sushrut/FacultyIPDList'));
const FacultyOPDList = lazy(() => import('@/views/sushrut/FacultyOPDList'));
const InsuranceHospitalList = lazy(() => import('@/views/sushrut/InsuranceHospitalList'));
const InsuranceList = lazy(() => import('@/views/sushrut/InsuranceList'));
const CreateInsuranceHospital = lazy(() => import('@/views/sushrut/CreateInsuranceHospital'));
const ReimbursmentList = lazy(() => import('@/views/sushrut/ReimbursementList'));
const EmpanelledHospitalList = lazy(() => import('@/views/sushrut/EmpanelledHospitalList'));
const CreateAdditionalInfo = lazy(() => import('@/views/sushrut/CreateAdditionalInfo'));
const AdditionalInfoList = lazy(() => import('@/views/sushrut/AdditionalInfoList'));
const CurrentSlots = lazy(() => import('@/views/sushrut/CurrentSlots'));
const CreateDoctor = lazy(() => import('@/views/sushrut/createDoctor'));
const DoctorsManagement = lazy(() => import('@/views/sushrut/doctorsManagement'));
const AppointmentBooking = lazy(() => import('@/views/sushrut/appointmentBooking'));

const SushrutRoutes: RouteObject = {
  path: '/sushrut',
  element: <MainLayout />,
  children: [
    {
      path: 'create-empanelled-hospital',
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
    {
      path: 'list-faculty-ipd',
      element: <FacultyIPDList />,
    },
    {
      path: 'list-faculty-opd',
      element: <FacultyOPDList />,
    },
    {
      path: 'list-insurance',
      element: <InsuranceList />,
    },
    {
      path: 'list-insurance-hospital',
      element: <InsuranceHospitalList />,
    },
    {
      path: 'create-insurance',
      element: <CreateInsurance />,
    },
    {
      path: 'add-insurance-hospital',
      element: <CreateInsuranceHospital />,
    },
    {
      path: 'list-student-reimbursment',
      element: <ReimbursmentList />,
    },
    {
      path: 'list-empanelled-hospital',
      element: <EmpanelledHospitalList />,
    },
    {
      path: 'create-additional-info',
      element: <CreateAdditionalInfo />,
    },
    {
      path: 'list-additional-information',
      element: <AdditionalInfoList />,
    },
    {
      path: 'slots',
      element: <CurrentSlots />,
    },
    {
      path: 'create-doctor',
      element: <CreateDoctor />,
    },
    {
      path: 'doctor-slots',
      element: <DoctorsManagement />,
    },
    {
      path: 'appointment',
      element: <AppointmentBooking />,
    },
  ],
};

export default SushrutRoutes;
