import { useState } from 'react';
import { Loader2, Pencil, Trash2, Users, UserPen } from 'lucide-react';
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
import { useCourses, useUpdateCourse, useDeleteCourse } from '@/hooks';
import { FieldType } from '@/types';
import { useNavigate } from 'react-router-dom';

const editSchema: FieldType[] = [
  { name: 'name', label: 'Name', type: 'text', required: true, columns: 2 },
  { name: 'room_id', label: 'Room ID', type: 'text', required: true, columns: 2 },
  { name: 'slot_id', label: 'Slot ID', type: 'text', required: true, columns: 2 },
];

const CourseManagement = () => {
  const [editCourse, setEditCourse] = useState<any | null>(null);
  const [sidePanel, setSidePanel] = useState<{
    type: 'instructors' | 'students' | null;
    course: any | null;
  }>({ type: null, course: null });

  const { data: courses = [], isFetching } = useCourses();
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
        <span role="img" aria-label="sessions">
          📅
        </span>
      </Button>
    ),
    'Slot-Room': (row: any) => {
      // Add comprehensive null/undefined checks
      const slotRoomData = row?._row?.slot_room_id;

      // Return empty div if data doesn't exist or isn't an array
      if (!slotRoomData || !Array.isArray(slotRoomData) || slotRoomData.length === 0) {
        return (
          <div className="flex flex-wrap gap-2">
            <span className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-500 text-xs italic">
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
                  className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-500 text-xs italic"
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
                className="inline-block px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-mono"
              >
                {slotId}
                {roomIds && `: ${roomIds}`}
              </span>
            );
          })}
        </div>
      );
    },
  };

  const getTableData = (courses: any[]) =>
    courses.map(course => ({
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
    }));

  return (
    <HelmetWrapper
      title="Courses | Seamless"
      heading="Courses List"
      subHeading="List of courses for Bodhika."
    >
      <DynamicTable
        tableHeading="Courses"
        data={getTableData(courses)}
        customRender={customRender}
        isLoading={isFetching}
      />
      <Dialog
        open={!!editCourse}
        onOpenChange={open => {
          if (!open) setEditCourse(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          <DynamicForm
            schema={editSchema}
            onSubmit={handleUpdate}
            defaultValues={editCourse ?? undefined}
            onCancel={() => setEditCourse(null)}
            submitButtonText="Save"
          />
        </DialogContent>
      </Dialog>

      {/* Side Panel for Instructors/Students */}
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
              bg-card border-l border-border
              shadow-2xl
              overflow-hidden
              flex flex-col
              rounded-l-xl
            "
          style={{ width: '90vw', maxWidth: '1200px' }}
        >
          <div className="flex-1 overflow-y-auto">
            <div className="p-8 space-y-6">
              {sidePanel.type === 'instructors' && sidePanel.course && (
                <>
                  <div className="border-b border-border pb-4">
                    <h2 className="text-2xl font-bold text-foreground mb-2">Instructors</h2>
                    <p className="text-sm text-muted-foreground">
                      List of instructors for{' '}
                      <span className="font-semibold">{sidePanel.course.name}</span>
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                    {Array.isArray(sidePanel.course.instructors) &&
                    sidePanel.course.instructors.length > 0 ? (
                      sidePanel.course.instructors.map((inst: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center py-2 border-b border-border/50"
                        >
                          <span className="text-sm font-medium text-muted-foreground">
                            {inst.instructor_ldap}
                          </span>
                          <span className="text-sm font-semibold text-foreground">
                            {inst.instruction_type}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="w-full text-center py-8">
                        <span className="text-muted-foreground text-sm">
                          No instructors assigned
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
              {sidePanel.type === 'students' && sidePanel.course && (
                <>
                  <div className="border-b border-border pb-4">
                    <h2 className="text-2xl font-bold text-foreground mb-2">Students</h2>
                    <p className="text-sm text-muted-foreground">
                      List of students for{' '}
                      <span className="font-semibold">{sidePanel.course.name}</span>
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                    {Array.isArray(sidePanel.course.students) &&
                    sidePanel.course.students.length > 0 ? (
                      sidePanel.course.students.map((student: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center py-2 border-b border-border/50"
                        >
                          <span className="text-sm font-medium text-foreground">{student}</span>
                        </div>
                      ))
                    ) : (
                      <div className="w-full text-center py-8">
                        <span className="text-muted-foreground text-sm">No students assigned</span>
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
