import { useState, useMemo } from 'react';
import {
  Loader2,
  Pencil,
  Trash2,
  Users,
  UserPen,
  BookOpen,
  BarChart3,
  Calendar,
  Target,
} from 'lucide-react';
import {
  DynamicForm,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DynamicTable,
  Button,
  Sheet,
  SheetContent,
  SheetTitle,
  HelmetWrapper,
  toast,
} from '@/components';
import { useCourses, useCourseFilters, useUpdateCourse, useDeleteCourse } from '@/hooks';
import { FieldType, FilterConfig } from '@/types';
import { useNavigate } from 'react-router-dom';

const editSchema: FieldType[] = [
  { name: 'name', label: 'Name', type: 'text', required: true, columns: 2 },
  { name: 'room_id', label: 'Room ID', type: 'text', required: true, columns: 2 },
  { name: 'slot_id', label: 'Slot ID', type: 'text', required: true, columns: 2 },
];

const CourseManagement = () => {
  // Filter state
  const [selectedCourseCode, setSelectedCourseCode] = useState<string | undefined>(undefined);
  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>(undefined);
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(undefined);
  const [selectedSem, setSelectedSem] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch filter options
  const { data: filterOptions } = useCourseFilters();

  // Fetch courses with backend filters
  const { data, isFetching } = useCourses({
    search,
    sem: selectedSem,
    slot_id: selectedSlotId,
    room_id: selectedRoomId,
    course_code: selectedCourseCode,
    page,
    page_size: limit,
  });

  const courses = data?.results ?? [];
  const totalCount = data?.total ?? 0;

  // Calculate statistics
  const uniqueCourses = new Set(courses.map(c => c.course_code)).size;
  const totalInstructors = courses.reduce(
    (acc, course) => acc + (Array.isArray(course.instructors) ? course.instructors.length : 0),
    0
  );
  const totalStudents = courses.reduce(
    (acc, course) => acc + (Array.isArray(course.students) ? course.students.length : 0),
    0
  );

  // FilterConfig for DynamicTable
  const filterConfig: FilterConfig[] = useMemo(
    () => [
      {
        column: 'Course Code',
        type: 'dropdown',
        options: filterOptions?.course_codes ?? [],
        value: selectedCourseCode,
        onChange: (val: string | undefined) => {
          setSelectedCourseCode(val);
          setPage(1);
        },
      },
      {
        column: 'Slot',
        type: 'dropdown',
        options: filterOptions?.slots?.map(s => s.slot_id) ?? [],
        value: selectedSlotId,
        onChange: (val: string | undefined) => {
          setSelectedSlotId(val);
          setPage(1);
        },
      },
      {
        column: 'Room',
        type: 'dropdown',
        options: filterOptions?.rooms?.map(r => r.room_id) ?? [],
        value: selectedRoomId,
        onChange: (val: string | undefined) => {
          setSelectedRoomId(val);
          setPage(1);
        },
      },
      {
        column: 'Semester',
        type: 'dropdown',
        options: filterOptions?.sems ?? [],
        value: selectedSem,
        onChange: (val: string | undefined) => {
          setSelectedSem(val);
          setPage(1);
        },
      },
    ],
    [filterOptions, selectedCourseCode, selectedSlotId, selectedRoomId, selectedSem]
  );

  const [editCourse, setEditCourse] = useState<any | null>(null);
  const [sidePanel, setSidePanel] = useState<{
    type: 'instructors' | 'students' | null;
    course: any | null;
  }>({ type: null, course: null });

  const updateMutation = useUpdateCourse();
  const deleteMutation = useDeleteCourse();
  const navigate = useNavigate();
  const handleEdit = (course: any) => setEditCourse(course);

  const handleUpdate = async (formData: Record<string, any>) => {
    if (!editCourse) return;
    await updateMutation.mutateAsync({
      course_id: editCourse.course_id,
      payload: {
        name: formData.name,
        room_id: formData.room_id,
        slot_id: formData.slot_id,
      },
    });
    toast({ title: 'Course updated' });
    setEditCourse(null);
  };

  const handleDelete = async (course_id: string) => {
    await deleteMutation.mutateAsync(course_id);
    toast({ title: 'Course deleted' });
  };

  const customRender = {
    Edit: (_: any, row: Record<string, any>) => (
      <Button
        size="icon"
        variant="ghost"
        onClick={e => {
          e.stopPropagation();
          handleEdit(row._row);
        }}
      >
        <Pencil className="w-4 h-4" />
      </Button>
    ),
    Delete: (_: any, row: Record<string, any>) => (
      <Button
        size="icon"
        variant="destructive"
        onClick={e => {
          e.stopPropagation();
          handleDelete(row._row.course_id);
        }}
        disabled={deleteMutation.isPending}
      >
        {deleteMutation.isPending ? (
          <Loader2 className="animate-spin w-4 h-4" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </Button>
    ),
    Instructors: (_: any, row: Record<string, any>) => (
      <Button
        size="icon"
        variant="outline"
        onClick={e => {
          e.stopPropagation();
          setSidePanel({ type: 'instructors', course: row._row });
        }}
        aria-label="Show Instructors"
      >
        <UserPen className="w-4 h-4" />
      </Button>
    ),
    Students: (_: any, row: Record<string, any>) => (
      <Button
        size="icon"
        variant="outline"
        onClick={e => {
          e.stopPropagation();
          setSidePanel({ type: 'students', course: row._row });
        }}
        aria-label="Show Students"
      >
        <Users className="w-4 h-4" />
      </Button>
    ),
    'View Sessions': (_: any, row: Record<string, any>) => (
      <Button
        size="icon"
        variant="outline"
        onClick={e => {
          e.stopPropagation();
          navigate(`/bodhika/course-session/${row._row.course_id}`);
        }}
        aria-label="View Sessions"
      >
        <Calendar className="w-4 h-4" />
      </Button>
    ),
    'Slot-Room': (_: any, row: Record<string, any>) => {
      // Add comprehensive null/undefined checks
      const slotRoomData = row?._row?.slot_room_id;
      // Return empty div if data doesn't exist or isn't an array
      if (!slotRoomData || !Array.isArray(slotRoomData) || slotRoomData.length === 0) {
        return (
          <div className="flex flex-wrap gap-2">
            <span className="inline-block px-2 py-1 rounded bg-muted text-muted-foreground text-xs italic">
              No slot data
            </span>
          </div>
        );
      }

      return (
        <div className="flex flex-wrap gap-2">
          {slotRoomData.map((sr: any, idx: number) => {
            // Additional safety check for each slot room item
            if (!sr) {
              return (
                <span
                  key={idx}
                  className="inline-block px-2 py-1 rounded bg-muted-foreground/10 text-muted-foreground text-xs italic"
                >
                  Invalid data
                </span>
              );
            }

            // Build the display text safely
            const slotId = sr?.slot_id || 'No slot';
            const roomIds =
              Array.isArray(sr?.room_id) && sr.room_id.length > 0
                ? sr.room_id.filter((id: null) => id != null).join(', ')
                : '';

            return (
              <span
                key={idx}
                className="inline-block px-2 py-1 rounded bg-chip-blue/10 text-chip-blue text-xs font-mono"
              >
                {slotId}..
                {roomIds && `: ${roomIds}`}
              </span>
            );
          })}
        </div>
      );
    },
  };

  const getTableData = (courses: any[]) =>
    Array.isArray(courses)
      ? courses.map(course => ({
          'Course Code': course.course_code,
          Name: course.name,
          Semester: course.sem,
          'Slot-Room': '',
          Instructors: '',
          Students: '',
          'View Sessions': '',
          Edit: '',
          Delete: '',
          _row: { ...course },
        }))
      : [];

  return (
    <HelmetWrapper
      title="Courses | Seamless"
      heading="Course Management"
      subHeading="Comprehensive course management system for academic administration"
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
                <p className="text-2xl font-bold text-card-blue">{courses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-green-gradient rounded-2xl p-6 border-2 border-card-green">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-green-icon rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-green font-medium mb-1">Unique Courses</p>
                <p className="text-2xl font-bold text-card-green">{uniqueCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-purple-gradient rounded-2xl p-6 border-2 border-card-purple">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-purple-icon rounded-xl flex items-center justify-center">
                <UserPen className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-purple font-medium mb-1">Total Instructors</p>
                <p className="text-2xl font-bold text-card-purple">{totalInstructors}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-orange-gradient rounded-2xl p-6 border-2 border-card-orange">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-orange-icon rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-orange font-medium mb-1">Total Students</p>
                <p className="text-2xl font-bold text-card-orange">{totalStudents}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Course Table Container */}
        <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              Course Database
            </h2>
            <p className="text-muted-foreground mt-2">
              Manage and monitor all academic courses with detailed instructor and student
              information
            </p>
          </div>

          <div className="p-6">
            <DynamicTable
              tableHeading="Courses"
              data={getTableData(courses)}
              customRender={customRender}
              isLoading={isFetching}
              filterConfig={filterConfig}
              filterMode="ui"
              onSearchChange={setSearch}
              page={page}
              onPageChange={setPage}
              limit={limit}
              onLimitChange={setLimit}
              total={totalCount}
            />
          </div>
        </div>
      </div>

      {/* Enhanced Edit Dialog */}
      <Dialog
        open={!!editCourse}
        onOpenChange={open => {
          if (!open) setEditCourse(null);
        }}
      >
        <DialogContent className="bg-gradient-to-br from-background to-muted/20 border-2 border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Pencil className="w-6 h-6 text-primary" />
              Edit Course Details
            </DialogTitle>
          </DialogHeader>
          <DynamicForm
            schema={editSchema}
            onSubmit={handleUpdate}
            defaultValues={editCourse ?? undefined}
            onCancel={() => setEditCourse(null)}
            submitButtonText="Save Changes"
          />
        </DialogContent>
      </Dialog>

      {/* Enhanced Side Panel for Instructors/Students */}
      <Sheet
        open={!!sidePanel.type}
        onOpenChange={open => !open && setSidePanel({ type: null, course: null })}
      >
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
          <div className="flex-1 overflow-y-auto">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 border-b-2 border-border">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                  {sidePanel.type === 'instructors' ? (
                    <UserPen className="w-8 h-8 text-primary-foreground" />
                  ) : (
                    <Users className="w-8 h-8 text-primary-foreground" />
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">
                    {sidePanel.type === 'instructors' ? 'Course Instructors' : 'Enrolled Students'}
                  </h2>
                  <p className="text-muted-foreground">
                    {sidePanel.type === 'instructors'
                      ? 'Teaching staff assigned to this course'
                      : 'Students registered for this course'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {sidePanel.course && (
                <>
                  {/* Course Information Card */}
                  <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      Course Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-background rounded-xl p-4 border border-border shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            Course Code
                          </span>
                          <span className="text-lg font-bold font-mono text-primary">
                            {sidePanel.course.course_code}
                          </span>
                        </div>
                      </div>
                      <div className="bg-background rounded-xl p-4 border border-border shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            Course Name
                          </span>
                          <span className="text-lg font-bold text-foreground">
                            {sidePanel.course.name}
                          </span>
                        </div>
                      </div>
                      <div className="bg-background rounded-xl p-4 border border-border shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            Semester
                          </span>
                          <span className="text-lg font-bold text-foreground">
                            {sidePanel.course.sem}
                          </span>
                        </div>
                      </div>
                      <div className="bg-background rounded-xl p-4 border border-border shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            {sidePanel.type === 'instructors'
                              ? 'Total Instructors'
                              : 'Total Students'}
                          </span>
                          <span className="text-lg font-bold text-primary">
                            {sidePanel.type === 'instructors'
                              ? Array.isArray(sidePanel.course.instructors)
                                ? sidePanel.course.instructors.length
                                : 0
                              : Array.isArray(sidePanel.course.students)
                                ? sidePanel.course.students.length
                                : 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Content Section */}
                  <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
                    <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                      {sidePanel.type === 'instructors' ? (
                        <>
                          <UserPen className="w-5 h-5 text-primary" />
                          Instructor Details
                        </>
                      ) : (
                        <>
                          <Users className="w-5 h-5 text-primary" />
                          Student Roster
                        </>
                      )}
                    </h3>

                    {sidePanel.type === 'instructors' && sidePanel.course && (
                      <div className="space-y-4">
                        {Array.isArray(sidePanel.course.instructors) &&
                        sidePanel.course.instructors.length > 0 ? (
                          <div className="grid gap-4">
                            {sidePanel.course.instructors.map((inst: any, idx: number) => (
                              <div
                                key={idx}
                                className="bg-background rounded-xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                      <UserPen className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-foreground">
                                        {inst.instructor_ldap}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        Instructor LDAP
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                                      {inst.instruction_type}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-background rounded-xl border border-border">
                            <UserPen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground font-semibold text-lg">
                              No instructors assigned
                            </p>
                            <p className="text-muted-foreground/70 text-sm mt-2">
                              Instructors will appear here once assigned to this course
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {sidePanel.type === 'students' && sidePanel.course && (
                      <div className="space-y-4">
                        {Array.isArray(sidePanel.course.students) &&
                        sidePanel.course.students.length > 0 ? (
                          <div className="grid gap-3">
                            {sidePanel.course.students.map((student: string, idx: number) => (
                              <div
                                key={idx}
                                className="bg-background rounded-xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Users className="w-5 h-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-foreground font-mono">
                                      {student}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Student ID</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-background rounded-xl border border-border">
                            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground font-semibold text-lg">
                              No students enrolled
                            </p>
                            <p className="text-muted-foreground/70 text-sm mt-2">
                              Student enrollments will appear here once registered
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </HelmetWrapper>
  );
};

export default CourseManagement;
