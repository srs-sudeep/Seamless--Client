import { DynamicForm, HelmetWrapper, toast } from '@/components';
import { Card, CardContent } from '@/components/ui/card';
import { useCreateVendor } from '@/hooks';
import { type FieldType } from '@/types';
import { useState } from 'react';

const schema: FieldType[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Vendor Details',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Vendor Details',
  },
  {
    name: 'ldapid',
    label: 'LDAP ID',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Vendor Details',
  },
  {
    name: 'address',
    label: 'Address',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Vendor Details',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Vendor Details',
  },
  {
    name: 'password',
    label: 'Password',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Vendor Details',
  },
  {
    name: 'idNumber',
    label: 'ID Number',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Vendor Details',
  },
];

const CreateVendors = () => {
  const createMutation = useCreateVendor();
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  const handleFormChange = (values: Record<string, any>) => {
    const updated = { ...values };
    if (updated.course_code && updated.sem) {
      updated.course_id = `${updated.course_code}-${updated.sem}`;
    }
    setFormValues(updated);
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    const payload = {
      ldapid: formData.ldapid,
      email: formData.email,
      address: formData.address,
      description: formData.description,
      is_active: true,
      guest_user: {
        ldapid: formData.ldapid,
        idNumber: formData.idNumber,
        name: formData.name,
        is_active: true,
        password: formData.password,
        roles: ['messVendor'],
      },
    };
    await createMutation.mutateAsync(payload);
    toast({ title: 'Vendor created Successfully' });
    setFormValues({});
  };

  return (
    <HelmetWrapper
      title="Create Vendor | Seamless"
      heading="Create Vendor"
      subHeading="Add a new vendor with instructors."
    >
      <Card className="border border-border ">
        <CardContent className="p-0">
          <DynamicForm
            schema={schema}
            onSubmit={handleSubmit}
            submitButtonText={createMutation.isPending ? 'Creating...' : 'Create Vendor'}
            disabled={createMutation.isPending}
            defaultValues={formValues}
            onChange={handleFormChange}
          />
        </CardContent>
      </Card>
    </HelmetWrapper>
  );
};

export default CreateVendors;
