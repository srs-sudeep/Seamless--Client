import { useState, useMemo } from 'react';
import {
  Loader2,
  Pencil,
  Plus,
  Trash2,
  UserCheck,
  BookOpen,
  Users,
  Target,
  TrendingUp,
  GraduationCap,
  BarChart3,
} from 'lucide-react';
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

  // Calculate statistics
  const totalInstructors = instructors.length;
  const uniqueCourses = new Set(instructors.map(i => i.course_id)).size;
  const lectureInstructors = instructors.filter(i => i.instruction_type === 'Lecture').length;
  const tutorialInstructors = instructors.filter(i => i.instruction_type === 'Tutorial').length;
  const labInstructors = instructors.filter(i => i.instruction_type === 'Lab').length;

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
    'Instruction Type': (value: string) => {
      const colorClass =
        value === 'Lecture'
          ? 'text-success bg-success/10 border-success'
          : value === 'Tutorial'
            ? 'text-chip-purple bg-chip-purple/10 border-chip-purple'
            : value === 'Lab'
              ? 'text-chip-blue bg-chip-blue/10 border-chip-blue'
              : 'text-gray-600';
      return (
        <span className={`px-2 py-0.5 rounded-full ${colorClass} text-xs font-medium border`}>
          {value}
        </span>
      );
    },
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

  if (isFetching && instructors.length === 0) {
    return (
      <HelmetWrapper
        title="Instructors | Seamless"
        heading="Instructor Management"
        subHeading="Comprehensive instructor management system for academic administration"
      >
        <div className="flex justify-center items-center h-96 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading instructor data...</p>
          </div>
        </div>
      </HelmetWrapper>
    );
  }

  return (
    <HelmetWrapper
      title="Instructors | Seamless"
      heading="Instructor Management"
      subHeading="Comprehensive instructor management system for academic administration"
    >
      <div className="space-y-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card-blue-gradient rounded-2xl p-6 border-2 border-card-blue">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-blue-icon rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-blue font-medium mb-1">Total Instructors</p>
                <p className="text-2xl font-bold text-card-blue">{totalInstructors}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-green-gradient rounded-2xl p-6 border-2 border-card-green">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-green-icon rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-background" />
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
                <GraduationCap className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-purple font-medium mb-1">Lecture Instructors</p>
                <p className="text-2xl font-bold text-card-purple">{lectureInstructors}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-orange-gradient rounded-2xl p-6 border-2 border-card-orange">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-orange-icon rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-orange font-medium mb-1">Tutorial & Lab</p>
                <p className="text-2xl font-bold text-card-orange">
                  {tutorialInstructors + labInstructors}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Instruction Type Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-background" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Lecture Instructors</h3>
                <p className="text-sm text-muted-foreground">Primary course instructors</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success mb-2">{lectureInstructors}</div>
              <div className="text-sm text-muted-foreground">
                {totalInstructors > 0
                  ? Math.round((lectureInstructors / totalInstructors) * 100)
                  : 0}
                % of total
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-chip-purple rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-background" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Tutorial Instructors</h3>
                <p className="text-sm text-muted-foreground">Tutorial session leaders</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-chip-purple mb-2">{tutorialInstructors}</div>
              <div className="text-sm text-muted-foreground">
                {totalInstructors > 0
                  ? Math.round((tutorialInstructors / totalInstructors) * 100)
                  : 0}
                % of total
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-chip-blue rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-background" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Lab Instructors</h3>
                <p className="text-sm text-muted-foreground">Laboratory supervisors</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-chip-blue mb-2">{labInstructors}</div>
              <div className="text-sm text-muted-foreground">
                {totalInstructors > 0 ? Math.round((labInstructors / totalInstructors) * 100) : 0}%
                of total
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Instructor Table Container */}
        <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              Instructor Database
            </h2>
            <p className="text-muted-foreground mt-2">
              Manage instructor assignments, track course allocations, and maintain academic staff
              records
            </p>
          </div>

          <div className="p-6">
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
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Instructor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gradient-to-br from-background to-muted/20 border-2 border-border">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                          <Plus className="w-6 h-6 text-primary" />
                          Add New Instructor
                        </DialogTitle>
                      </DialogHeader>
                      <DynamicForm
                        schema={createSchema}
                        onSubmit={handleCreate}
                        onCancel={() => setCreateDialogOpen(false)}
                        submitButtonText="Create Instructor"
                        defaultValues={createFormValues}
                        onChange={setCreateFormValues}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              }
            />
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Quick Actions</h3>
              <p className="text-sm text-muted-foreground">Common instructor management tasks</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
              <Plus className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">
                Click "Add Instructor" to assign new teaching staff
              </span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
              <Pencil className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">
                Use edit icon to modify instructor assignments
              </span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
              <Target className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">
                Filter by course, semester, or instruction type
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Edit Dialog */}
      <Dialog
        open={!!editInstructor}
        onOpenChange={open => {
          if (!open) setEditInstructor(null);
        }}
      >
        <DialogContent className="bg-gradient-to-br from-background to-muted/20 border-2 border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Pencil className="w-6 h-6 text-primary" />
              Edit Instructor Assignment
            </DialogTitle>
          </DialogHeader>
          <DynamicForm
            schema={editSchema}
            onSubmit={handleUpdate}
            defaultValues={editFormValues}
            onCancel={() => setEditInstructor(null)}
            submitButtonText="Save Changes"
            onChange={setEditFormValues}
          />
        </DialogContent>
      </Dialog>
    </HelmetWrapper>
  );
};

export default InstructorManagement;
