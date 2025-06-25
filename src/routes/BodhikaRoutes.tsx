import MainLayout from '@/layouts/MainLayout';
import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

// Lazy load admin views
const SlotsManagement = lazy(() => import('@/views/bodhika/slotsManagement'));
const RoomsManagement = lazy(() => import('@/views/bodhika/roomsManagement'));
const CourseManagement = lazy(() => import('@/views/bodhika/courseManagement'));
const InstructorManagement = lazy(() => import('@/views/bodhika/instructorManagement'));
const StudentsManagement = lazy(() => import('@/views/bodhika/studentsManagement'));
const CreateCourse = lazy(() => import('@/views/bodhika/createCourse'));
const CreateSession = lazy(() => import('@/views/bodhika/createSession'));
const Sessions = lazy(() => import('@/views/bodhika/sessions'));
const CourseIndi = lazy(() => import('@/views/bodhika/courseIndi'));
const RoomSession = lazy(() => import('@/views/bodhika/RoomSession'));
const InstructorCourses = lazy(() => import('@/views/bodhika/instructorCourses'));
const StudentCourses = lazy(() => import('@/views/bodhika/studentCourses'));
const CourseAnalysis = lazy(() => import('@/views/bodhika/courseAnalysis'));

const BodhikaRoutes: RouteObject = {
  path: '/bodhika',
  element: <MainLayout />,
  children: [
    {
      path: 'slots-management',
      element: <SlotsManagement />,
    },
    {
      path: 'room-list',
      element: <RoomsManagement />,
    },
    {
      path: 'course-list',
      element: <CourseManagement />,
    },
    {
      path: 'course-session',
      element: <Outlet />,
      children: [
        {
          path: ':course_id',
          element: <CourseIndi />,
        },
      ],
    },
    {
      path: 'create-course',
      element: <CreateCourse />,
    },
    {
      path: 'instructor-list',
      element: <InstructorManagement />,
    },
    {
      path: 'student-list',
      element: <StudentsManagement />,
    },
    {
      path: 'session-create',
      element: <CreateSession />,
    },
    {
      path: 'sessions',
      element: <Sessions />,
    },
    {
      path: 'room-session',
      element: <RoomSession />,
    },
    {
      path: 'instructor-courses',
      element: <InstructorCourses />,
    },
    {
      path: 'student-courses',
      element: <StudentCourses />,
    },
    {
      path: 'course-analysis',
      element: <CourseAnalysis />,
    },
  ],
};

export default BodhikaRoutes;
