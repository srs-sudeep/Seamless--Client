import { useState } from 'react';
import { HelmetWrapper, DynamicForm, toast } from '@/components';
import { useCreateCourse } from '@/hooks/bodhika/useCourse.hook';
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
    });
    toast({ title: 'Course created' });
    // Optionally reset form or redirect
  };

  return (
    <HelmetWrapper
      title="Create Course | Seamless"
      heading="Create Course"
      subHeading="Add a new course with instructors."
    >
      <div className="mx-6 p-6 bg-background rounded-xl">
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
