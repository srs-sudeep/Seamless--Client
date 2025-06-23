import { useState } from 'react';
import {
  DynamicTable,
  HelmetWrapper,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components';
import { useStudentAttendance } from '@/hooks';
import { Loader2 } from 'lucide-react';

const CourseAnalysis = () => {
  const { data, isLoading } = useStudentAttendance();
  const [tab, setTab] = useState<'registered' | 'unregistered'>('registered');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  const courses = data?.courses ?? [];
  const registeredCourses = courses.filter(c => c.is_registered);
  const unregisteredCourses = courses.filter(c => !c.is_registered);

  // Table columns except attendances
  const getCourseTableData = (courses: any[]) =>
    courses.map(course => ({
      'Course ID': course.course_id,
      'Course Name': course.course_name,
      Semester: course.sem,
      'Total Sessions': course.total_sessions,
      'Present Count': course.present_count,
      'Attendance %': course.attendance_percentage,
      'Consecutive Absences': course.consecutive_absence_count,
      'Has Consecutive Absences': course.has_consecutive_absences ? 'Yes' : 'No',
      _row: course,
    }));

  // Attendance table
  const getAttendanceTableData = (attendances: any[]) =>
    attendances.map(a => ({
      'Session ID': a.session_id,
      Date: a.date,
      'Start Time': a.start_time,
      'End Time': a.end_time,
      Status: a.status,
      'Room ID': a.room_id,
      'Room Name': a.room_name,
      'Device ID': a.device_id,
      Timestamp: a.timestamp,
    }));

  // Expandable row
  const renderExpandedComponent = (row: any) => {
    if (!row._row?.attendances?.length) return null;
    return (
      <div className="p-2">
        <DynamicTable
          tableHeading="Attendances"
          data={getAttendanceTableData(row._row.attendances)}
          disableSearch
        />
      </div>
    );
  };

  return (
    <HelmetWrapper title="Course Analysis" heading="Course Analysis">
      <Tabs value={tab} onValueChange={value => setTab(value as 'registered' | 'unregistered')}>
        <TabsList>
          <TabsTrigger value="registered">Registered</TabsTrigger>
          <TabsTrigger value="unregistered">Unregistered</TabsTrigger>
        </TabsList>
        <TabsContent value="registered">
          <DynamicTable
            tableHeading="Registered Courses"
            data={getCourseTableData(registeredCourses)}
            expandableRows
            expandedComponent={renderExpandedComponent}
            rowExpandable={row =>
              Array.isArray(row._row?.attendances) && row._row.attendances.length > 0
            }
          />
        </TabsContent>
        <TabsContent value="unregistered">
          <DynamicTable
            tableHeading="Unregistered Courses"
            data={getCourseTableData(unregisteredCourses)}
            expandableRows
            expandedComponent={renderExpandedComponent}
            rowExpandable={row =>
              Array.isArray(row._row?.attendances) && row._row.attendances.length > 0
            }
          />
        </TabsContent>
      </Tabs>
    </HelmetWrapper>
  );
};

export default CourseAnalysis;
