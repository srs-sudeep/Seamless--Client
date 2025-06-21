import { useState } from 'react';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
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
import {
  useInstructors,
  useCreateInstructor,
  useUpdateInstructor,
  useDeleteInstructor,
} from '@/hooks';
import { FieldType } from '@/types';

const createSchema: FieldType[] = [
  { name: 'instructor_ldap', label: 'Instructor LDAP', type: 'text', required: true, columns: 2 },
  { name: 'course_code', label: 'Course Code', type: 'text', required: true, columns: 1 },
  { name: 'sem', label: 'Semester', type: 'text', required: true, columns: 1 },
  {
    name: 'instruction_type',
    label: 'Instruction Type',
    type: 'select',
    required: true,
    columns: 2,
    options: [
      { value: 'Lecture', label: 'Lecture' },
      { value: 'Tutorial', label: 'Tutorial' },
      { value: 'Lab', label: 'Lab' },
    ],
  },
];

const editSchema: FieldType[] = [
  { name: 'course_code', label: 'Course Code', type: 'text', required: true, columns: 1 },
  { name: 'sem', label: 'Semester', type: 'text', required: true, columns: 1 },
  {
    name: 'instruction_type',
    label: 'Instruction Type',
    type: 'select',
    required: true,
    columns: 2,
    options: [
      { value: 'Lecture', label: 'Lecture' },
      { value: 'Tutorial', label: 'Tutorial' },
      { value: 'Lab', label: 'Lab' },
    ],
  },
];

const InstructorManagement = () => {
  const { data: instructors = [], isLoading } = useInstructors();
  const createMutation = useCreateInstructor();
  const updateMutation = useUpdateInstructor();
  const deleteMutation = useDeleteInstructor();

  const [editInstructor, setEditInstructor] = useState<any | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // For create form values
  const [createFormValues, setCreateFormValues] = useState<Record<string, any>>({});
  // For edit form values
  const [editFormValues, setEditFormValues] = useState<Record<string, any>>({});

  const handleEdit = (instructor: any) => {
    // Split course_id into course_code and sem for editing
    let course_code = '';
    let sem = '';
    if (instructor.course_id && instructor.course_id.includes('-')) {
      const dashIdx = instructor.course_id.indexOf('-');
      course_code = instructor.course_id.slice(0, dashIdx);
      sem = instructor.course_id.slice(dashIdx + 1);
    }
    setEditFormValues({
      ...instructor,
      course_code,
      sem,
    });
    setEditInstructor(instructor);
  };

  const handleUpdate = async (formData: Record<string, any>) => {
    if (!editInstructor) return;
    const course_id = `${formData.course_code}-${formData.sem}`;
    await updateMutation.mutateAsync({
      instructor_ldap: editInstructor.instructor_ldap,
      payload: {
        course_id,
        instruction_type: formData.instruction_type,
      },
    });
    toast({ title: 'Instructor updated' });
    setEditInstructor(null);
  };

  const handleCreate = async (formData: Record<string, any>) => {
    const course_id = `${formData.course_code}-${formData.sem}`;
    await createMutation.mutateAsync({
      instructor_ldap: formData.instructor_ldap,
      course_id,
      instruction_type: formData.instruction_type,
    });
    toast({ title: 'Instructor created' });
    setCreateDialogOpen(false);
    setCreateFormValues({});
  };

  const handleDelete = async (instructor_ldap: string) => {
    await deleteMutation.mutateAsync(instructor_ldap);
    toast({ title: 'Instructor deleted' });
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
          handleDelete(row._row.instructor_ldap);
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
  };

  const getTableData = (instructors: any[]) =>
    instructors.map(inst => {
      let course_code = '';
      let sem = '';
      if (inst.course_id && inst.course_id.includes('-')) {
        const dashIdx = inst.course_id.indexOf('-');
        course_code = inst.course_id.slice(0, dashIdx);
        sem = inst.course_id.slice(dashIdx + 1);
      }
      return {
        'Instructor LDAP': inst.instructor_ldap,
        'Course Code': course_code,
        Semester: sem,
        'Instruction Type': inst.instruction_type,
        Edit: '',
        Delete: '',
        _row: { ...inst },
      };
    });

  return (
    <HelmetWrapper
      title="Instructors | Seamless"
      heading="Instructors List"
      subHeading="List of instructors for Bodhika."
    >
      <div className="mx-auto p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          <DynamicTable
            tableHeading="Instructors"
            data={getTableData(instructors)}
            customRender={customRender}
            headerActions={
              <div className="flex gap-2">
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Instructor
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Instructor</DialogTitle>
                    </DialogHeader>
                    <DynamicForm
                      schema={createSchema}
                      onSubmit={handleCreate}
                      onCancel={() => setCreateDialogOpen(false)}
                      submitButtonText="Create"
                      defaultValues={createFormValues}
                      onChange={setCreateFormValues}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            }
          />
        )}
        <Dialog
          open={!!editInstructor}
          onOpenChange={open => {
            if (!open) setEditInstructor(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Instructor</DialogTitle>
            </DialogHeader>
            <DynamicForm
              schema={editSchema}
              onSubmit={handleUpdate}
              defaultValues={editFormValues}
              onCancel={() => setEditInstructor(null)}
              submitButtonText="Save"
              onChange={setEditFormValues}
            />
          </DialogContent>
        </Dialog>
      </div>
    </HelmetWrapper>
  );
};

export default InstructorManagement;
