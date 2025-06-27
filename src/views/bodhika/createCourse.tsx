import { DynamicForm, HelmetWrapper, toast } from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCreateCourse } from '@/hooks';
import { type FieldType as BaseFieldType } from '@/types';
import { Download, FileSpreadsheet, Upload } from 'lucide-react';
import Papa from 'papaparse';
import { useState } from 'react';

type FieldType = BaseFieldType & {
  fields?: FieldType[];
  minItems?: number;
  maxItems?: number;
  section?: string;
  addButtonText?: string;
};

const schema: FieldType[] = [
  {
    name: 'course_code',
    label: 'Course Code',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Course Details',
  },
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Course Details',
  },
  {
    name: 'sem',
    label: 'Semester',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Course Details',
  },
  {
    name: 'course_id',
    label: 'Course ID',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Course Details',
    disabled: true,
  },
  {
    name: 'slot_room_id',
    label: 'Slot & Room(s)',
    type: 'array',
    minItems: 1,
    section: 'Slot & Room Details',
    columns: 2,
    addButtonText: 'Add Slot',
    fields: [
      {
        name: 'slot_id',
        label: 'Slot ID',
        type: 'text',
        required: true,
      },
      {
        name: 'room_id',
        label: 'Room ID(s)',
        type: 'array',
        minItems: 1,
        addButtonText: 'Add Room',
        fields: [
          {
            name: 'room_id',
            label: 'Room ID',
            type: 'text',
            required: true,
          },
        ],
      },
    ],
  },
  {
    name: 'instructors',
    label: 'Instructors',
    type: 'array',
    minItems: 1,
    section: 'Instructor Details',
    fields: [
      { name: 'instructor_ldap', label: 'Instructor LDAP', type: 'text', required: true },
      {
        name: 'instruction_type',
        label: 'Instruction Type',
        type: 'select',
        required: true,
        options: [
          { value: 'Lecture', label: 'Lecture' },
          { value: 'Tutorial', label: 'Tutorial' },
          { value: 'Lab', label: 'Lab' },
        ],
      },
    ],
    columns: 2,
  },
];

const CreateCourse = () => {
  const createMutation = useCreateCourse();
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  // handle CSV data
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const row = results.data[0];
        if (!row) {
          toast({ title: 'CSV is empty', variant: 'destructive' });
          return;
        }

        // Parse slot_room_id: "A1,lhcl101,lhcl102;A2,lhcl103"
        const slot_room_id = (row.slot_room_id || '')
          .split(';')
          .filter(Boolean)
          .map((slotGroup: string) => {
            const [slot_id, ...room_ids] = slotGroup.split(',').map((s: string) => s.trim());
            return {
              slot_id,
              room_id: room_ids,
            };
          });
        const instructors = (row.instructors || '')
          .split(';')
          .filter(Boolean)
          .map((instGroup: string) => {
            const [instructor_ldap, instruction_type] = instGroup
              .split(',')
              .map((s: string) => s.trim());
            return {
              instructor_ldap,
              instruction_type,
            };
          });

        const formData = {
          course_id: row.course_id || `${row.course_code}-${row.sem}`,
          course_code: row.course_code,
          name: row.name,
          sem: row.sem,
          slot_room_id,
          instructors,
        };

        setFormValues(formData);
        handleSubmit(formData);
        toast({ title: 'CSV uploaded', description: 'Course data loaded from CSV.' });
      },
      error: () => {
        toast({ title: 'CSV upload failed', variant: 'destructive' });
      },
    });
  };

  // Add this function inside your component
  const handleDownloadCsvFormat = () => {
    const headers = ['course_code', 'name', 'sem', 'slot_room_id', 'instructors'];
    // Example data rows
    const rows = [
      [
        'DS101',
        'Introduction to CS',
        '1',
        'A1,LHCL103,LHCL104;A2,LHCL105',
        'amitkdhar,Lecture;dhimansaha,Lab',
      ],
    ];

    const csvContent =
      headers.join(',') +
      '\n' +
      rows.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'course_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFormChange = (values: Record<string, any>) => {
    const updated = { ...values };
    if (updated.course_code && updated.sem) {
      updated.course_id = `${updated.course_code}-${updated.sem}`;
    }
    setFormValues(updated);
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    const validInstructors = Array.isArray(formData.instructors)
      ? formData.instructors.filter((inst: any) => inst.instructor_ldap && inst.instruction_type)
      : [];
    if (validInstructors.length === 0) {
      toast({ title: 'At least one instructor is required', variant: 'destructive' });
      return;
    }

    // Always treat room_id as an array
    const slotRoomMap: Record<string, string[]> = {};
    if (Array.isArray(formData.slot_room_id)) {
      formData.slot_room_id.forEach((sr: any) => {
        const slotId = sr.slot_id;
        let roomIds: string[] = [];
        if (Array.isArray(sr.room_id)) {
          // Array of objects or strings
          roomIds = sr.room_id.map((r: any) => (typeof r === 'string' ? r : r.room_id));
        } else if (typeof sr.room_id === 'string') {
          // Single string, wrap in array
          roomIds = [sr.room_id];
        } else if (sr.room_id && typeof sr.room_id === 'object' && sr.room_id.room_id) {
          // Single object
          roomIds = [sr.room_id.room_id];
        }
        if (!slotRoomMap[slotId]) {
          slotRoomMap[slotId] = [];
        }
        slotRoomMap[slotId].push(...roomIds);
      });
    }
    // Prepare final slot_room_id array as required by API
    const slot_room_id = Object.entries(slotRoomMap).map(([slot_id, room_id]) => ({
      slot_id,
      room_id: Array.from(new Set(room_id)), // remove duplicates if any
    }));

    await createMutation.mutateAsync({
      course_id: formData.course_id,
      course_code: formData.course_code,
      name: formData.name,
      sem: formData.sem,
      slot_room_id,
      instructors: validInstructors,
    } as any);
    toast({ title: 'Course created' });
    // Optionally reset form or redirect
  };

  return (
    <HelmetWrapper
      title="Create Course | Seamless"
      heading="Create Course"
      subHeading="Add a new course with instructors."
    >
      {/* CSV Upload Section with shadcn/ui components */}
      <Card className="mb-8 border border-border bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button
              variant="outline"
              onClick={handleDownloadCsvFormat}
              className="w-full sm:w-auto flex items-center gap-2 bg-background text-foreground border-muted-foreground/20 transition-colors"
            >
              <Download className="h-4 w-4 text-foreground" />
              <span>Download CSV Template</span>
            </Button>

            <div className="relative w-full sm:w-auto">
              <Button
                variant="default"
                className="w-full sm:w-auto flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span>Upload CSV File</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  aria-label="Upload CSV file"
                />
              </Button>
            </div>

            <div className="hidden sm:block">
              <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          <div className="mt-4 text-sm bg-background text-foreground border border-border p-3 rounded-md">
            <p className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-primary flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              Upload a CSV file with the required columns:{' '}
              <span className="font-mono font-medium">course_code</span>,{' '}
              <span className="font-mono font-medium">name</span>,{' '}
              <span className="font-mono font-medium">sem</span>,{' '}
              <span className="font-mono font-medium">slot_room_id</span>, and{' '}
              <span className="font-mono font-medium">instructors</span>.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border bg-card">
        <CardContent className="p-0">
          <DynamicForm
            schema={schema}
            onSubmit={handleSubmit}
            submitButtonText={createMutation.isPending ? 'Creating...' : 'Create Course'}
            disabled={createMutation.isPending}
            defaultValues={formValues}
            onChange={handleFormChange}
          />
        </CardContent>
      </Card>
    </HelmetWrapper>
  );
};

export default CreateCourse;
