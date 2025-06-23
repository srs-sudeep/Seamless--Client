import { useState, useMemo } from 'react';
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
  useInstructorFilters,
  useCreateInstructor,
  useUpdateInstructor,
  useDeleteInstructor,
} from '@/hooks';
import { FieldType, FilterConfig } from '@/types';

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
  // Filter state
  const [selectedCourseCode, setSelectedCourseCode] = useState<string | undefined>(undefined);
  const [selectedInstructionType, setSelectedInstructionType] = useState<string | undefined>(
    undefined
  );
  const [selectedSem, setSelectedSem] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch filter options
  const { data: filterOptions } = useInstructorFilters();

  // Fetch instructors with backend filters
  const { data, isFetching } = useInstructors({
    search,
    course_code: selectedCourseCode,
    sem: selectedSem,
    instruction_type: selectedInstructionType,
    page,
    page_size: limit,
  });

  const instructors = data?.results ?? [];
  const totalCount = data?.total ?? 0;

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
        column: 'Instruction Type',
        type: 'dropdown',
        options: filterOptions?.instruction_types ?? [],
        value: selectedInstructionType,
        onChange: (val: string | undefined) => {
          setSelectedInstructionType(val);
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
    [filterOptions, selectedCourseCode, selectedInstructionType, selectedSem]
  );

  const [editInstructor, setEditInstructor] = useState<any | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Mutations
  const createMutation = useCreateInstructor();
  const updateMutation = useUpdateInstructor();
  const deleteMutation = useDeleteInstructor();

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

  // Table data mapping
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
      <DynamicTable
        tableHeading="Instructors"
        data={getTableData(instructors)}
        isLoading={isFetching}
        customRender={customRender}
        filterConfig={filterConfig}
        filterMode="ui"
        onSearchChange={setSearch}
        page={page}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={setLimit}
        total={totalCount}
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
    </HelmetWrapper>
  );
};

export default InstructorManagement;
