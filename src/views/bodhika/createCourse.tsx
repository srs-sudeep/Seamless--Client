import { useState } from 'react';
import { HelmetWrapper, DynamicForm, toast } from '@/components';
import { useCreateCourse } from '@/hooks/bodhika/useCourse.hook';
import { type FieldType as BaseFieldType } from '@/types';

type FieldType = BaseFieldType & {
  fields?: BaseFieldType[];
  minItems?: number;
  maxItems?: number;
  section?: string;
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
    name: 'slot_id',
    label: 'Slot ID',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Course Details',
  },
  {
    name: 'room_id',
    label: 'Room ID',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Course Details',
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

    // Auto-fill course_id only if both inputs are present
    if (updated.course_code && updated.sem) {
      updated.course_id = `${updated.course_code}-${updated.sem}`;
    }

    setFormValues(updated);
  };

  // Submit handler
  const handleSubmit = async (formData: Record<string, any>) => {
    const validInstructors = Array.isArray(formData.instructors)
      ? formData.instructors.filter((inst: any) => inst.instructor_ldap && inst.instruction_type)
      : [];
    if (validInstructors.length === 0) {
      toast({ title: 'At least one instructor is required', variant: 'destructive' });
      return;
    }
    await createMutation.mutateAsync({
      course_id: formData.course_id,
      course_code: formData.course_code,
      name: formData.name,
      sem: formData.sem,
      slot_id: formData.slot_id,
      room_id: formData.room_id,
      instructors: validInstructors,
      students: [],
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
