import { HelmetWrapper, DynamicTable, Button } from '@/components';
import { useDownloadCSV, useMyInstructorCourses } from '@/hooks';
import { downloadAttendanceExcel } from '@/lib/downloadAttendanceExcel';
import { FilterConfig } from '@/types';
import { Download, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const InstructorCourses = () => {
  const { data: courses = [], isLoading } = useMyInstructorCourses();
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>('');
  const navigate = useNavigate();

  const handleCSVDownload = async (row: any) => {
    const courseId = row?._row?.course_id;
    setSelectedCourseCode(courseId);
  };

  const { data: csvData = {} } = useDownloadCSV(selectedCourseCode);

  useEffect(() => {
    if (csvData && selectedCourseCode) {
      downloadAttendanceExcel(csvData);
      setSelectedCourseCode('');
    }
  }, [csvData, selectedCourseCode]);

  const getTableData = (courses: any[]) =>
    Array.isArray(courses)
      ? courses.map(course => ({
          'Course Code': course.course_code,
          Name: course.name,
          Semester: course.sem,
          Slot: Array.isArray(course.slot_room_id)
            ? course.slot_room_id.map((sr: any) => sr.slot_id).join(', ')
            : '',
          Room: Array.isArray(course.slot_room_id)
            ? course.slot_room_id.flatMap((sr: any) => sr.room_id).join(', ')
            : '',
          'Download CSV': '',
          _row: course,
        }))
      : [];

  const customRender = {
    'Download CSV': (_: any, _row: Record<string, any>) => (
      <Button
        size="icon"
        variant="ghost"
        onClick={e => {
          e.stopPropagation();
          handleCSVDownload(_row);
        }}
      >
        <Download className="w-4 h-4" />
      </Button>
    ),
  };

  // 1. Extract all unique semesters for filter options
  const allSemesters = useMemo(() => {
    const set = new Set<string>();
    courses.forEach(course => {
      if (course?.sem) {
        set.add(course?.sem);
      }
    });
    return Array.from(set);
  }, [courses]);

  // 1. Extract all unique room IDs for filter options
  const allRoomIds = useMemo(() => {
    const set = new Set<string>();
    courses.forEach(course => {
      if (Array.isArray(course?.slot_room_id)) {
        course.slot_room_id.forEach((slot: any) => {
          if (Array.isArray(slot?.room_id)) {
            slot.room_id.forEach((roomId: string) => {
              if (roomId) set.add(roomId);
            });
          }
        });
      }
    });
    return Array.from(set);
  }, [courses]);

  // 1. Extract all unique slot IDs for filter options
  const allSlotIds = useMemo(() => {
    const set = new Set<string>();
    courses.forEach(course => {
      if (Array.isArray(course?.slot_room_id)) {
        course.slot_room_id.forEach((slot: any) => {
          if (slot?.slot_id) set.add(slot.slot_id);
        });
      }
    });
    return Array.from(set);
  }, [courses]);

  // 2. Define filter configuration
  const filterConfig: FilterConfig[] = [
    {
      column: 'Semester',
      type: 'dropdown',
      options: allSemesters,
    },
    {
      column: 'Slot',
      type: 'dropdown',
      options: allSlotIds,
    },
    {
      column: 'Room',
      type: 'dropdown',
      options: allRoomIds,
    },
  ];

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
            filterConfig={filterConfig} // 3. Pass filterConfig here
            customRender={customRender}
          />
        )}
      </div>
    </HelmetWrapper>
  );
};

export default InstructorCourses;
