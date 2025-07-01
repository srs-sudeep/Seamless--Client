import { HelmetWrapper, DynamicTable, Button } from '@/components';
import { useDownloadCSV, useMyInstructorCourses } from '@/hooks';
import { downloadAttendanceExcel } from '@/lib';
import { FilterConfig } from '@/types';
import {
  Download,
  Loader2,
  BookOpen,
  Calendar,
  MapPin,
  Clock,
  BarChart3,
  Target,
  TrendingUp,
} from 'lucide-react';
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

  // Calculate statistics
  const totalCourses = courses.length;
  const uniqueSemesters = new Set(courses.map(c => c.sem)).size;
  const totalSlots = courses.reduce(
    (acc, course) => acc + (Array.isArray(course.slot_room_id) ? course.slot_room_id.length : 0),
    0
  );
  const totalRooms = courses.reduce(
    (acc, course) =>
      acc +
      (Array.isArray(course.slot_room_id)
        ? course.slot_room_id.reduce(
            (roomAcc, slot) => roomAcc + (Array.isArray(slot.room_id) ? slot.room_id.length : 0),
            0
          )
        : 0),
    0
  );

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

  // Extract all unique semesters for filter options
  const allSemesters = useMemo(() => {
    const set = new Set<string>();
    courses.forEach(course => {
      if (course?.sem) {
        set.add(course?.sem);
      }
    });
    return Array.from(set);
  }, [courses]);

  // Extract all unique room IDs for filter options
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

  // Extract all unique slot IDs for filter options
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

  // Define filter configuration
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

  if (isLoading) {
    return (
      <HelmetWrapper
        title="My Courses | Seamless"
        heading="My Courses"
        subHeading="Courses you are instructing"
      >
        <div className="flex justify-center items-center h-96 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your courses...</p>
          </div>
        </div>
      </HelmetWrapper>
    );
  }

  return (
    <HelmetWrapper
      title="My Courses | Seamless"
      heading="My Courses"
      subHeading="Comprehensive overview of courses you are instructing with quick access to attendance data"
    >
      <div className="space-y-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card-blue-gradient rounded-2xl p-6 border-2 border-card-blue">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-blue-icon rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-blue font-medium mb-1">Total Courses</p>
                <p className="text-2xl font-bold text-card-blue">{totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-green-gradient rounded-2xl p-6 border-2 border-card-green">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-green-icon rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-green font-medium mb-1">Semesters</p>
                <p className="text-2xl font-bold text-card-green">{uniqueSemesters}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-purple-gradient rounded-2xl p-6 border-2 border-card-purple">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-purple-icon rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-purple font-medium mb-1">Time Slots</p>
                <p className="text-2xl font-bold text-card-purple">{totalSlots}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-orange-gradient rounded-2xl p-6 border-2 border-card-orange">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-orange-icon rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-orange font-medium mb-1">Total Rooms</p>
                <p className="text-2xl font-bold text-card-orange">{totalRooms}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Course Table Container */}
        <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              Teaching Schedule
            </h2>
            <p className="text-muted-foreground mt-2">
              Manage your courses, download attendance data, and track session analytics
            </p>
          </div>

          <div className="p-6">
            <DynamicTable
              tableHeading="My Courses"
              data={getTableData(courses)}
              onRowClick={row => navigate(`/bodhika/course-session/${row._row.course_id}`)}
              filterConfig={filterConfig}
              customRender={customRender}
            />
          </div>
        </div>

        {/* Additional Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Quick Actions</h3>
                <p className="text-sm text-muted-foreground">Streamline your workflow</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <Download className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">
                  Click download icon to export attendance data
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">
                  Click any row to view detailed session analytics
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-background" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Teaching Overview</h3>
                <p className="text-sm text-muted-foreground">Your current academic load</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                <span className="text-sm font-medium text-muted-foreground">Active Courses</span>
                <span className="text-lg font-bold text-foreground">{totalCourses}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                <span className="text-sm font-medium text-muted-foreground">
                  Teaching Locations
                </span>
                <span className="text-lg font-bold text-foreground">{allRoomIds.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HelmetWrapper>
  );
};

export default InstructorCourses;
