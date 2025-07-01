import { useState, useRef, useMemo } from 'react';
import {
  Plus,
  Download,
  Upload,
  Users,
  GraduationCap,
  BookOpen,
  Target,
  BarChart3,
  FileSpreadsheet,
  Database,
  Activity,
  TrendingUp,
  Loader2,
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
  const { data: students = [], isFetching } = useStudents();
  const createMutation = useCreateStudent();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // CSV Template headers
  const csvTemplate = 'student_id,course_code,sem\n';

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalStudents = students.length;

    // Get all unique courses and semesters
    const uniqueCourses = new Set();
    const uniqueSemesters = new Set();
    const semesterCounts: Record<string, number> = {};

    students.forEach((student: any) => {
      if (Array.isArray(student.courses)) {
        student.courses.forEach((courseId: string) => {
          const dashIdx = courseId.indexOf('-');
          if (dashIdx !== -1) {
            const courseCode = courseId.slice(0, dashIdx);
            const semester = courseId.slice(dashIdx + 1);
            uniqueCourses.add(courseCode);
            uniqueSemesters.add(semester);
            semesterCounts[semester] = (semesterCounts[semester] || 0) + 1;
          }
        });
      }
    });

    // Find most popular semester
    const mostPopularSemester = Object.entries(semesterCounts).reduce(
      (max, [sem, count]) => (count > max.count ? { semester: sem, count } : max),
      { semester: 'None', count: 0 }
    );

    // Average courses per student
    const totalCourseEnrollments = students.reduce(
      (sum, student: any) => sum + (Array.isArray(student.courses) ? student.courses.length : 0),
      0
    );
    const avgCoursesPerStudent =
      totalStudents > 0 ? (totalCourseEnrollments / totalStudents).toFixed(1) : 0;

    return {
      totalStudents,
      totalCourses: uniqueCourses.size,
      totalSemesters: uniqueSemesters.size,
      mostPopularSemester,
      avgCoursesPerStudent,
      semesterCounts,
    };
  }, [students]);

  // Download CSV template
  const handleDownloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle CSV import
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async event => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(Boolean);
      const [header, ...rows] = lines;
      const headers = header.split(',').map(h => h.trim());
      const importedStudents = rows.map(row => {
        const values = row.split(',').map(v => v.trim());
        const student: any = {};
        headers.forEach((h, i) => {
          student[h] = values[i];
        });
        return student;
      });
      // Group by student_id
      const grouped: Record<string, { student_id: string; courses: string[] }> = {};
      importedStudents.forEach(s => {
        if (!s.student_id || !s.course_code || !s.sem) return;
        if (!grouped[s.student_id]) {
          grouped[s.student_id] = { student_id: s.student_id, courses: [] };
        }
        grouped[s.student_id].courses.push(`${s.course_code}-${s.sem}`);
      });
      // Bulk create students (in parallel, and wait for all)
      await Promise.all(
        Object.values(grouped).map(student =>
          createMutation.mutateAsync({
            student_id: student.student_id,
            course_ids: student.courses,
          })
        )
      );
      toast({ title: 'Students imported successfully' });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCreate = async (formData: Record<string, any>) => {
    // Join course_code and sem for each course
    const course_ids = Array.isArray(formData.courses)
      ? formData.courses
          .filter((c: any) => c.course_code && c.sem)
          .map((c: any) => `${c.course_code}-${c.sem}`)
      : [];
    await createMutation.mutateAsync({
      student_id: formData.student_id,
      course_ids,
    });
    toast({ title: 'Student created successfully' });
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

  if (isFetching && students.length === 0) {
    return (
      <HelmetWrapper
        title="Students | Seamless"
        heading="Student Management"
        subHeading="Comprehensive student enrollment and course management system"
      >
        <div className="flex justify-center items-center h-96 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading student data...</p>
          </div>
        </div>
      </HelmetWrapper>
    );
  }

  return (
    <HelmetWrapper
      title="Students | Seamless"
      heading="Student Management"
      subHeading="Comprehensive student enrollment and course management system with bulk import capabilities"
    >
      <div className="space-y-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {statistics.totalStudents}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
                  Unique Courses
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {statistics.totalCourses}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
                  Active Semesters
                </p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {statistics.totalSemesters}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl p-6 border-2 border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-1">
                  Avg Courses
                </p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {statistics.avgCoursesPerStudent}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enrollment Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Enrollment Overview</h3>
                <p className="text-sm text-muted-foreground">Student distribution insights</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                <span className="text-sm font-medium text-muted-foreground">
                  Most Popular Semester
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-foreground">
                    {statistics.mostPopularSemester.semester}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({statistics.mostPopularSemester.count} enrollments)
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                <span className="text-sm font-medium text-muted-foreground">
                  Courses per Student
                </span>
                <span className="text-lg font-bold text-foreground">
                  {statistics.avgCoursesPerStudent}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Quick Actions</h3>
                <p className="text-sm text-muted-foreground">Manage student enrollments</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <Plus className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">
                  Add students with multiple course enrollments
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <Upload className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Bulk import from CSV files</span>
              </div>
            </div>
          </div>
        </div>

        {/* Semester Distribution */}
        {Object.keys(statistics.semesterCounts).length > 0 && (
          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-info rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Semester Distribution</h3>
                <p className="text-sm text-muted-foreground">Student enrollment across semesters</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(statistics.semesterCounts)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([semester, count]) => (
                  <div
                    key={semester}
                    className="bg-background rounded-xl p-4 border border-border shadow-sm"
                  >
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Sem {semester}</div>
                      <div className="text-xl font-bold text-foreground">{count}</div>
                      <div className="text-xs text-muted-foreground">students</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Management Tools */}
        <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-warning rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Bulk Operations</h3>
              <p className="text-sm text-muted-foreground">Import/export student enrollment data</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
                <Download className="w-4 h-4 text-primary" />
                <div>
                  <span className="font-medium text-foreground">CSV Template</span>
                  <p className="text-sm text-muted-foreground">Download template for bulk import</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
                <Upload className="w-4 h-4 text-primary" />
                <div>
                  <span className="font-medium text-foreground">Bulk Import</span>
                  <p className="text-sm text-muted-foreground">Import multiple students from CSV</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
                <Database className="w-4 h-4 text-primary" />
                <div>
                  <span className="font-medium text-foreground">Data Format</span>
                  <p className="text-sm text-muted-foreground">student_id, course_code, sem</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
                <Users className="w-4 h-4 text-primary" />
                <div>
                  <span className="font-medium text-foreground">Multiple Courses</span>
                  <p className="text-sm text-muted-foreground">
                    Students can be enrolled in multiple courses
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Students Table Container */}
        <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              Student Directory
            </h2>
            <p className="text-muted-foreground mt-2">
              Comprehensive management of student enrollments with course tracking and bulk import
              capabilities
            </p>
          </div>

          <div className="p-6">
            <DynamicTable
              tableHeading="Students"
              data={getTableData(students)}
              isLoading={isFetching || createMutation.isPending}
              headerActions={
                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Student
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gradient-to-br from-background to-muted/20 border-2 border-border">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                          <Plus className="w-6 h-6 text-primary" />
                          Create New Student
                        </DialogTitle>
                      </DialogHeader>
                      <DynamicForm
                        schema={createSchema}
                        onSubmit={handleCreate}
                        onCancel={() => setCreateDialogOpen(false)}
                        submitButtonText="Create Student"
                      />
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    onClick={handleDownloadTemplate}
                    className="border-2 border-border hover:bg-muted/50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    CSV Template
                  </Button>

                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import CSV
                  </Button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleImportCSV}
                  />
                </div>
              }
            />
          </div>
        </div>
      </div>
    </HelmetWrapper>
  );
};

export default StudentsManagement;
