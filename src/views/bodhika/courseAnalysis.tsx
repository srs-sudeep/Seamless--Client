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
import {
  ArrowRight,
  Loader2,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Users,
  Target,
} from 'lucide-react';
import { useState } from 'react';

const CourseAnalysis = () => {
  const { data, isLoading } = useStudentAttendance();
  const [tab, setTab] = useState<'registered' | 'unregistered'>('registered');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  if (isLoading) {
    return (
      <HelmetWrapper title="Course Analysis" heading="Course Analysis">
        <div className="flex justify-center items-center h-96 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading course analysis...</p>
          </div>
        </div>
      </HelmetWrapper>
    );
  }

  const courses = data?.courses ?? [];
  const registeredCourses = courses.filter(c => c.is_registered);
  const unregisteredCourses = courses.filter(c => !c.is_registered);

  // Calculate overall statistics
  const totalCourses = courses.length;
  const averageAttendance =
    courses.length > 0
      ? (
          courses.reduce((sum, course) => sum + course.attendance_percentage, 0) / courses.length
        ).toFixed(1)
      : 0;
  const criticalCourses = courses.filter(c => c.attendance_percentage < 75).length;
  const consecutiveAbsenceCourses = courses.filter(c => c.has_consecutive_absences).length;

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
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-destructive"></div>
          <span className="text-destructive text-xs font-medium">Consecutive Absences</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-success"></div>
          <span className="text-success text-xs font-medium">Regular Attendance</span>
        </div>
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
      let colorClass = 'bg-destructive/10 text-destructive border-destructive';
      if (value >= 75) {
        colorClass = 'bg-success/10 text-success border-success';
      } else if (value >= 50) {
        colorClass = 'bg-chip-yellow/10 text-chip-yellow border-chip-yellow';
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
          <span className="px-2 py-1 rounded-full text-xs font-medium border bg-success/10 text-success border-success">
            Present
          </span>
        ) : (
          <span className="px-2 py-1 rounded-full text-xs font-medium border bg-destructive/10 text-destructive border-destructive">
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
        <span className="px-2 py-1 rounded-full text-xs font-medium border bg-destructive/10 text-destructive border-destructive">
          Absent
        </span>
      ),
    }));

  return (
    <HelmetWrapper
      title="Course Analysis"
      heading="Course Analysis"
      subHeading="Comprehensive overview of your academic performance and attendance patterns"
    >
      <div className="space-y-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {totalCourses}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Total Courses
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {averageAttendance}%
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Avg Attendance
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl p-6 border-2 border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {criticalCourses}
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                  Critical Courses
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl p-6 border-2 border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {consecutiveAbsenceCourses}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  Consecutive Absences
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Tables */}
        <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              Course Performance Analysis
            </h2>
            <p className="text-muted-foreground mt-2">
              Track your attendance across all registered and unregistered courses
            </p>
          </div>

          <div className="p-6">
            <Tabs
              value={tab}
              onValueChange={value => setTab(value as 'registered' | 'unregistered')}
            >
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1 px-2 h-12">
                <TabsTrigger
                  value="registered"
                  className="flex items-center gap-2 text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Registered ({registeredCourses.length})
                </TabsTrigger>
                <TabsTrigger
                  value="unregistered"
                  className="flex items-center gap-2 text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Users className="w-4 h-4" />
                  Unregistered ({unregisteredCourses.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="registered" className="mt-0">
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

              <TabsContent value="unregistered" className="mt-0">
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
          </div>
        </div>
      </div>

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
            bg-gradient-to-br from-background to-muted/30
            border-l-2 border-border
            shadow-2xl
            overflow-hidden
            flex flex-col
            rounded-l-2xl
          "
          style={{ width: '90vw', maxWidth: '1200px' }}
        >
          {selectedCourse && (
            <div className="flex-1 overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 border-b-2 border-border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">Course Details</h2>
                    <p className="text-muted-foreground">
                      Comprehensive attendance analysis and performance metrics
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Course Information Card */}
                <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Course Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-background rounded-xl p-4 border border-border shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Course ID</span>
                        <span className="text-lg font-bold font-mono text-primary">
                          {selectedCourse.course_id}
                        </span>
                      </div>
                    </div>
                    <div className="bg-background rounded-xl p-4 border border-border shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          Course Name
                        </span>
                        <span className="text-lg font-bold text-foreground">
                          {selectedCourse.course_name}
                        </span>
                      </div>
                    </div>
                    <div className="bg-background rounded-xl p-4 border border-border shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Semester</span>
                        <span className="text-lg font-bold text-foreground">
                          {selectedCourse.sem}
                        </span>
                      </div>
                    </div>
                    <div className="bg-background rounded-xl p-4 border border-border shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Status</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            selectedCourse.is_registered
                              ? 'bg-success/10 text-success border-success'
                              : 'bg-destructive/10 text-destructive border-destructive'
                          }`}
                        >
                          {selectedCourse.is_registered ? 'Registered' : 'Unregistered'}
                        </span>
                      </div>
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
                      <div className="text-2xl font-bold text-success">
                        {selectedCourse.present_count}
                      </div>
                    </div>
                    <div className="bg-background rounded-lg p-4 border border-border shadow-sm">
                      <div className="text-sm text-muted-foreground mb-1">Attendance %</div>
                      <div
                        className={`text-2xl font-bold ${
                          selectedCourse.attendance_percentage >= 75
                            ? 'text-success'
                            : selectedCourse.attendance_percentage >= 50
                              ? 'text-chip-yellow'
                              : 'text-destructive'
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive">
                        {selectedCourse.consecutive_absence_count} Session(s)
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success">
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
