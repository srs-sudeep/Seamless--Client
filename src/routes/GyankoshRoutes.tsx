import lazyLoad from '@/lib/lazyLoad';
import MainLayout from '@/layouts/MainLayout';

// gyanlosh pages
const Checkouts = lazyLoad(() => import('@/views/gyankosh/Checkouts'));
const BookLists = lazyLoad(() => import('@/views/gyankosh/BookLists'));
const MyCheckouts = lazyLoad(() => import('@/views/gyankosh/MyCheckouts'));
const Books = lazyLoad(() => import('@/views/gyankosh/Books'));
const Attendance = lazyLoad(() => import('@/views/gyankosh/Attendance'));
const PatronLists = lazyLoad(() => import('@/views/gyankosh/PatronLists'));

const GyankoshRoutes = {
  path: 'gyankosh',
  element: <MainLayout />,
  children: [
    {
      path: 'checkouts',
      element: <Checkouts />,
    },
    {
      path: 'book-list',
      element: <BookLists />,
    },
    {
      path: 'my-checkouts',
      element: <MyCheckouts />,
    },
    {
      path: 'books',
      element: <Books />,
    },
    {
      path: 'attendance',
      element: <Attendance />,
    },
    {
      path: 'patron-list',
      element: <PatronLists />,
    },
  ],
};

export default GyankoshRoutes;
