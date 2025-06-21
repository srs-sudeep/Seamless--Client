import { HelmetWrapper, DynamicTable } from '@/components';
import { useMyInstructorCourses } from '@/hooks';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InstructorCourses = () => {
  const { data: courses = [], isLoading } = useMyInstructorCourses();
  const navigate = useNavigate();

  const getTableData = (courses: any[]) =>
    Array.isArray(courses)
      ? courses.map(course => ({
          'Course Code': course.course_code,
          Name: course.name,
          Semester: course.sem,
          Slot: course.slot_id,
          Room: course.room_id,
          _row: course, // keep the full course object for navigation
        }))
      : [];

  return (
    <HelmetWrapper
      title="My Courses | Seamless"
      heading="My Courses"
      subHeading="Courses you are instructing."
    >
      <div className="mx-auto p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          <DynamicTable
            tableHeading="My Courses"
            data={getTableData(courses)}
            onRowClick={row => navigate(`/bodhika/course-session/${row._row.course_id}`)}
          />
        )}
      </div>
    </HelmetWrapper>
  );
};

export default InstructorCourses;
