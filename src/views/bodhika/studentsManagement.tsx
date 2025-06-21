import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import {
  DynamicForm,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DynamicTable,
  Button,
  toast,
  HelmetWrapper,
} from '@/components';
import { useStudents, useCreateStudent } from '@/hooks';
import { type FieldType as BaseFieldType } from '@/types';

type FieldType = BaseFieldType & {
  fields?: BaseFieldType[];
  minItems?: number;
  maxItems?: number;
  section?: string;
};

const createSchema: FieldType[] = [
  { name: 'student_id', label: 'Student ID', type: 'text', required: true, columns: 2 },
  {
    name: 'courses',
    label: 'Courses',
    type: 'array',
    minItems: 1,
    columns: 2,
    fields: [
      { name: 'course_code', label: 'Course Code', type: 'text', required: true },
      { name: 'sem', label: 'Semester', type: 'text', required: true },
    ],
  },
];

const StudentsManagement = () => {
  const { data: students = [], isLoading } = useStudents();
  const createMutation = useCreateStudent();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleCreate = async (formData: Record<string, any>) => {
    // Join course_code and sem for each course
    const course_ids = Array.isArray(formData.courses)
      ? formData.courses
          .filter((c: any) => c.course_code && c.sem)
          .map((c: any) => `${c.course_code}-${c.sem}`)
      : [];
    await createMutation.mutateAsync({
      student_id: formData.student_id,
      courses: course_ids,
    });
    toast({ title: 'Student created' });
    setCreateDialogOpen(false);
  };

  const getTableData = (students: any[]) =>
    students.flatMap(student => {
      if (!Array.isArray(student.courses) || student.courses.length === 0) {
        return [
          {
            'Student ID': student.student_id,
            'Course Code': '',
            Semester: '',
            _row: { ...student },
          },
        ];
      }
      return student.courses.map((cid: string) => {
        const dashIdx = cid.indexOf('-');
        let course_code = cid;
        let sem = '';
        if (dashIdx !== -1) {
          course_code = cid.slice(0, dashIdx);
          sem = cid.slice(dashIdx + 1);
        }
        return {
          'Student ID': student.student_id,
          'Course Code': course_code,
          Semester: sem,
          _row: { ...student },
        };
      });
    });

  return (
    <HelmetWrapper
      title="Students | Seamless"
      heading="Students List"
      subHeading="List of students for Bodhika."
    >
      <div className="mx-auto p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          <DynamicTable
            tableHeading="Students"
            data={getTableData(students)}
            headerActions={
              <div className="flex gap-2">
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Student</DialogTitle>
                    </DialogHeader>
                    <DynamicForm
                      schema={createSchema}
                      onSubmit={handleCreate}
                      onCancel={() => setCreateDialogOpen(false)}
                      submitButtonText="Create"
                    />
                  </DialogContent>
                </Dialog>
              </div>
            }
          />
        )}
      </div>
    </HelmetWrapper>
  );
};

export default StudentsManagement;
