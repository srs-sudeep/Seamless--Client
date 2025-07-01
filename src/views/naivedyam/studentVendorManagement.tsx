import { useState } from 'react';
import { Loader2, Trash2, Plus } from 'lucide-react';
import {
  DynamicForm,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DynamicTable,
  Button,
  HelmetWrapper,
  toast,
} from '@/components';
import { useStudentVendors, useCreateStudentVendor, useDeleteStudentVendor } from '@/hooks';
import type { StudentVendor } from '@/types';

const schema = [
  { name: 'student_id', label: 'Student ID', type: 'text', required: true, columns: 2 },
  { name: 'vendor_id', label: 'Vendor ID', type: 'text', required: true, columns: 2 },
  { name: 'start_date', label: 'Start Date', type: 'date', required: true, columns: 2 },
  { name: 'end_date', label: 'End Date', type: 'date', required: false, columns: 2 },
];

const StudentVendorManagement = () => {
  const { data: studentVendors = [], isFetching } = useStudentVendors();
  const createMutation = useCreateStudentVendor();
  const deleteMutation = useDeleteStudentVendor();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleDelete = async (studentVendor: StudentVendor) => {
    await deleteMutation.mutateAsync({
      student_id: studentVendor.student_id,
      vendor_id: studentVendor.vendor_id,
    });
    toast({ title: 'Student Vendor deleted' });
  };

  const handleCreate = async (formData: Record<string, any>) => {
    await createMutation.mutateAsync({
      student_id: formData.student_id,
      vendor_id: formData.vendor_id,
      start_date: formData.start_date,
      end_date: formData.end_date,
    });
    toast({ title: 'Student Vendor created' });
    setCreateDialogOpen(false);
  };

  const customRender = {
    Delete: (_: any, row: Record<string, any>) => (
      <Button
        size="icon"
        variant="destructive"
        onClick={e => {
          e.stopPropagation();
          handleDelete(row._row);
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
    Active: (value: boolean) => (
      <span
        className={`px-2 py-0.5 rounded-full border ${value ? 'bg-success/10 border-success text-success' : 'bg-destructive/10 border-destructive text-destructive'} text-xs font-medium`}
      >
        {value ? 'Active' : 'Inactive'}
      </span>
    ),
  };

  const getTableData = (studentVendors: StudentVendor[]) =>
    studentVendors.map(sv => ({
      'Student ID': sv.student_id,
      'Vendor ID': sv.vendor_id,
      'Start Date': sv.start_date,
      'End Date': sv.end_date,
      Active: sv.is_active,
      Delete: '',
      _row: { ...sv },
    }));

  return (
    <HelmetWrapper
      title="Student Vendors | Naivedyam"
      heading="Student Vendors List"
      subHeading="List of student vendors for Naivedyam."
    >
      <DynamicTable
        tableHeading="Student Vendors"
        data={getTableData(studentVendors)}
        customRender={customRender}
        isLoading={isFetching}
        headerActions={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Student Vendor
          </Button>
        }
      />
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogTrigger asChild>
          <div />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Student Vendor</DialogTitle>
          </DialogHeader>
          <DynamicForm
            schema={schema}
            onSubmit={handleCreate}
            onCancel={() => setCreateDialogOpen(false)}
            submitButtonText={createMutation.isPending ? 'Creating...' : 'Create'}
            disabled={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </HelmetWrapper>
  );
};

export default StudentVendorManagement;
