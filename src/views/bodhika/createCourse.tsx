import { useState } from 'react';
import Papa from 'papaparse';
import { HelmetWrapper, DynamicForm, toast } from '@/components';
import { useCreateCourse } from '@/hooks';
import { type FieldType as BaseFieldType } from '@/types';

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
        console.log('CSV Results:', results);

        const row = results.data[0]; // Only first row for single course
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
        console.log('Parsed slot_room_id:', slot_room_id);

        // Parse instructors: "amitdhar,Lecture;dhimansaha,Lab"
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
        console.log('Instructors:', instructors);

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
      {/* CSV Upload Button */}
      <div className="mb-8 p-6 rounded-xl shadow-lg bg-white border border-gray-200 max-w-7xl w-full">
        <div className="flex items-center gap-4 mb-0">
          <button
            type="button"
            onClick={handleDownloadCsvFormat}
            className="flex items-center gap-2 px-4 py-2 rounded bg-primary text-white text-sm shadow hover:bg-primary-dark transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
              />
            </svg>
            Download CSV Format
          </button>
          {/* Custom Upload Button */}
          <label className="flex items-center gap-2 px-4 py-2 rounded bg-primary text-white text-sm shadow hover:bg-primary-dark transition cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v16h16V4H4zm4 8h8m-4-4v8"
              />
            </svg>
            Upload File
            <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
          </label>
        </div>
      </div>

      <div className=" bg-background rounded-xl">
        <DynamicForm
          schema={schema}
          onSubmit={handleSubmit}
          submitButtonText={createMutation.isPending ? 'Creating...' : 'Create Course'}
          disabled={createMutation.isPending}
          defaultValues={formValues}
          onChange={handleFormChange}
        />
      </div>
    </HelmetWrapper>
  );
};

export default CreateCourse;
