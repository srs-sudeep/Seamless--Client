import lazyLoad from '@/lib/lazyLoad';
import MainLayout from '@/layouts/MainLayout';

// Dashboard Pages
const AdminDashboard = lazyLoad(() => import('@/views/dashboard/AdminDashboard'));
const LibrarianDashboard = lazyLoad(() => import('@/views/dashboard/LibrarianDashboard'));
const MedicalStaffDashboard = lazyLoad(() => import('@/views/dashboard/MedicalStaffDashboard'));
const StudentDashboard = lazyLoad(() => import('@/views/dashboard/StudentDashboard'));
const AcademicsDashboard = lazyLoad(() => import('@/views/dashboard/AcademicsDashboard'));
const FacultyDashboard = lazyLoad(() => import('@/views/dashboard/FacultyDashboard'));
const Profile = lazyLoad(() => import('@/views/dashboard/Profile'));
const DoctorDashboard = lazyLoad(() => import('@/views/dashboard/DoctorDashboard'));
const MessVendorDashboard = lazyLoad(() => import('@/views/dashboard/MessVendorDashboard'));
const MessAdminDashboard = lazyLoad(() => import('@/views/dashboard/NaivedyamDashboard'));

const DashboardRoutes = {
  path: 'dashboard',
  element: <MainLayout />,
  children: [
    {
      path: 'profile',
      element: <Profile />,
    },
    {
      path: 'admin',
      element: <AdminDashboard />,
    },
    {
      path: 'library',
      element: <LibrarianDashboard />,
    },
    {
      path: 'medicalStaff',
      element: <MedicalStaffDashboard />,
    },
    {
      path: 'student',
      element: <StudentDashboard />,
    },
    {
      path: 'academics',
      element: <AcademicsDashboard />,
    },
    {
      path: 'faculty',
      element: <FacultyDashboard />,
    },
    {
      path: 'messadmin',
      element: <MessAdminDashboard />,
    },
    {
      path: 'messvendor',
      element: <MessVendorDashboard />,
    },
    {
      path: 'doctor',
      element: <DoctorDashboard />,
    },
  ],
};

export default DashboardRoutes;
