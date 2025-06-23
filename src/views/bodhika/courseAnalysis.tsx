import {
  Button,
  DynamicTable,
  HelmetWrapper,
  Sheet,
  SheetContent,
  SheetTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components';
import { useStudentAttendance } from '@/hooks';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';

const CourseAnalysis = () => {
  const { data, isLoading } = useStudentAttendance();
  const [tab, setTab] = useState<'registered' | 'unregistered'>('registered');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

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
      Status: course.has_consecutive_absences ? (
        <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium border border-amber-200">
          Has Consecutive Absences
        </span>
      ) : (
        <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium border border-green-200">
          No Consecutive Absences
        </span>
      ),
      Actions: (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 hover:bg-primary/10 text-xs"
          onClick={e => {
            e.stopPropagation();
            setSelectedCourse(course);
          }}
        >
          View Details <ArrowRight className="h-3 w-3" />
        </Button>
      ),
      _row: course,
    }));

  // Custom renderers for the course table
  const customCourseRenderer = {
    'Attendance %': (value: number) => {
      let colorClass = 'bg-red-100 text-red-800 border-red-200';
      if (value >= 75) {
        colorClass = 'bg-green-100 text-green-800 border-green-200';
      } else if (value >= 50) {
        colorClass = 'bg-amber-100 text-amber-800 border-amber-200';
      }
      return (
        <span className={`px-2 py-1 rounded-full ${colorClass} text-xs font-medium border`}>
          {value}%
        </span>
      );
    },
  };

  // Attendance table for expanded rows
  const getAttendanceTableData = (attendances: any[]) =>
    attendances.map(a => ({
      'Session ID': a.session_id,
      Date: new Date(a.date).toLocaleDateString(),
      'Start Time': new Date(a.start_time).toLocaleTimeString(),
      'End Time': new Date(a.end_time).toLocaleTimeString(),
      Status:
        a.status === 'Present' ? (
          <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium border border-green-200">
            Present
          </span>
        ) : (
          <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium border border-red-200">
            Absent
          </span>
        ),
      Room: a.room_name || 'N/A',
      'Device ID': a.device_id || 'N/A',
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

  // Get consecutive absence data for detailed view
  const getConsecutiveAbsenceData = (absences: any[] = []) =>
    absences.map(a => ({
      'Session ID': a.session_id,
      Date: new Date(a.date).toLocaleDateString(),
      'Start Time': new Date(a.start_time).toLocaleTimeString(),
      'End Time': new Date(a.end_time).toLocaleTimeString(),
      Status: (
        <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium border border-red-200">
          Absent
        </span>
      ),
    }));

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
            customRender={customCourseRenderer}
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
            customRender={customCourseRenderer}
          />
        </TabsContent>
      </Tabs>

      {/* Detailed Course View Sheet */}
      <Sheet open={!!selectedCourse} onOpenChange={open => !open && setSelectedCourse(null)}>
        <SheetTitle style={{ display: 'none' }} />
        <SheetContent
          side="right"
          className="
            p-0 
            fixed right-0 top-1/2 -translate-y-1/2
            min-h-fit max-h-[100vh]
            sm:w-[90vw] md:w-[70vw] lg:w-[60vw] xl:w-[50vw]
            bg-card border-l border-border
            shadow-2xl
            overflow-hidden
            flex flex-col
            rounded-l-xl
          "
          style={{ width: '90vw', maxWidth: '1200px' }}
        >
          {selectedCourse && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-8 space-y-6">
                <div className="border-b border-border pb-4">
                  <h2 className="text-3xl font-bold text-foreground mb-2">Course Details</h2>
                  <p className="text-sm text-muted-foreground">
                    Attendance statistics and detailed records
                  </p>
                </div>

                {/* Course Info */}
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Course Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-sm font-medium text-muted-foreground">Course ID</span>
                      <span className="text-sm font-mono text-foreground">
                        {selectedCourse.course_id}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-sm font-medium text-muted-foreground">Course Name</span>
                      <span className="text-sm font-semibold text-foreground">
                        {selectedCourse.course_name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-sm font-medium text-muted-foreground">Semester</span>
                      <span className="text-sm font-semibold text-foreground">
                        {selectedCourse.sem}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-sm font-medium text-muted-foreground">Status</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          selectedCourse.is_registered
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-orange-100 text-orange-700 border border-orange-200'
                        }`}
                      >
                        {selectedCourse.is_registered ? 'Registered' : 'Unregistered'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Attendance Statistics */}
                <div className="bg-muted/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Attendance Statistics
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-background rounded-lg p-4 border border-border shadow-sm">
                      <div className="text-sm text-muted-foreground mb-1">Total Sessions</div>
                      <div className="text-2xl font-bold">{selectedCourse.total_sessions}</div>
                    </div>
                    <div className="bg-background rounded-lg p-4 border border-border shadow-sm">
                      <div className="text-sm text-muted-foreground mb-1">Present Count</div>
                      <div className="text-2xl font-bold text-green-600">
                        {selectedCourse.present_count}
                      </div>
                    </div>
                    <div className="bg-background rounded-lg p-4 border border-border shadow-sm">
                      <div className="text-sm text-muted-foreground mb-1">Attendance %</div>
                      <div
                        className={`text-2xl font-bold ${
                          selectedCourse.attendance_percentage >= 75
                            ? 'text-green-600'
                            : selectedCourse.attendance_percentage >= 50
                              ? 'text-amber-600'
                              : 'text-red-600'
                        }`}
                      >
                        {selectedCourse.attendance_percentage}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consecutive Absences */}
                <div className="bg-muted/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    Consecutive Absences
                    {selectedCourse.has_consecutive_absences ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        {selectedCourse.consecutive_absence_count} Session(s)
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        None
                      </span>
                    )}
                  </h3>

                  {selectedCourse.has_consecutive_absences &&
                  selectedCourse.consecutive_absence_sessions?.length > 0 ? (
                    <DynamicTable
                      tableHeading="Consecutive Absence Sessions"
                      data={getConsecutiveAbsenceData(selectedCourse.consecutive_absence_sessions)}
                      disableSearch
                      className="border border-border rounded-md"
                    />
                  ) : (
                    <div className="text-center py-8 bg-background rounded-lg border border-border">
                      <p className="text-muted-foreground">No consecutive absences found</p>
                    </div>
                  )}
                </div>

                {/* All Attendance Records */}
                <div className="bg-muted/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    All Attendance Records
                  </h3>

                  {selectedCourse.attendances?.length > 0 ? (
                    <DynamicTable
                      data={getAttendanceTableData(selectedCourse.attendances)}
                      disableSearch
                      className="border border-border rounded-md"
                    />
                  ) : (
                    <div className="text-center py-8 bg-background rounded-lg border border-border">
                      <p className="text-muted-foreground">No attendance records found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </HelmetWrapper>
  );
};

export default CourseAnalysis;
