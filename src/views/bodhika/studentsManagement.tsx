import { useState, useRef } from 'react';
import { Plus, Download, Upload } from 'lucide-react';
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
      toast({ title: 'Students imported' });
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
      <DynamicTable
        tableHeading="Students"
        data={getTableData(students)}
        isLoading={isFetching || createMutation.isPending}
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
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
            <Button onClick={() => fileInputRef.current?.click()}>
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
    </HelmetWrapper>
  );
};

export default StudentsManagement;
