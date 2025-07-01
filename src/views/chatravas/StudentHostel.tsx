import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DynamicForm,
  DynamicTable,
  HelmetWrapper,
  toast,
  Switch,
} from '@/components';
import { useStudentHostels, useCreateStudentHostel, useDeleteStudentHostel } from '@/hooks';
import type { StudentHostel } from '@/types';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const createStudentHostelSchema = [
  { name: 'hostel_id', label: 'Hostel ID', type: 'text', required: true, columns: 2 },
  { name: 'student_id', label: 'Student ID', type: 'text', required: true, columns: 2 },
  { name: 'start_date', label: 'Start Date', type: 'date', required: true, columns: 2 },
];

const deleteStudentHostelSchema = [
  { name: 'end_date', label: 'End Date (optional)', type: 'date', required: false, columns: 2 },
];

const StudentHostel = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  });

  const { data, isFetching } = useStudentHostels({ limit, offset: (page - 1) * limit });
  const studentHostels: any = data ?? [];
  const totalCount = data?.total_count ?? studentHostels.length;

  const createMutation = useCreateStudentHostel();
  const deleteMutation = useDeleteStudentHostel();

  const handleCreate = async (formData: Record<string, any>) => {
    await createMutation.mutateAsync({
      hostel_id: formData.hostel_id,
      student_id: formData.student_id,
      start_date: formData.start_date,
      end_date: formData.end_date,
    });
    toast({ title: 'Student hostel entry created' });
    setCreateDialogOpen(false);
  };

  const handleDelete = async (formData: Record<string, any>) => {
    if (!deleteDialog.id) return;
    await deleteMutation.mutateAsync({
      id: deleteDialog.id,
      payload: {
        end_date: formData.end_date,
        is_deleted: true,
      },
    });
    toast({ title: 'Student hostel entry deleted' });
    setDeleteDialog({ open: false, id: null });
  };

  const getTableData = (studentHostels: StudentHostel[]) =>
    studentHostels.map(sh => ({
      ID: sh.id,
      'Hostel ID': sh.hostel_id,
      'Student ID': sh.student_id,
      'Start Date': sh.start_date,
      'End Date': sh.end_date,
      'Is Deleted': sh.is_deleted,
      Delete: '',
      _row: sh,
    }));

  const customRender = {
    'Is Deleted': (isDeleted: boolean) => (
      <Switch checked={isDeleted} disabled className="cursor-default" />
    ),
    Delete: (_: any, row: any) => (
      <Dialog
        open={deleteDialog.open && deleteDialog.id === row._row.id}
        onOpenChange={open => {
          if (!open) setDeleteDialog({ open: false, id: null });
        }}
      >
        <DialogTrigger asChild>
          <Button
            size="icon"
            variant="destructive"
            onClick={e => {
              e.stopPropagation();
              setDeleteDialog({ open: true, id: row._row.id });
            }}
            disabled={
              row._row.is_deleted || (deleteMutation.isPending && deleteDialog.id === row._row.id)
            }
            title={row._row.is_deleted ? 'Already deleted' : 'Delete'}
          >
            {deleteMutation.isPending && deleteDialog.id === row._row.id ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student Hostel Entry</DialogTitle>
          </DialogHeader>
          <DynamicForm
            schema={deleteStudentHostelSchema}
            onSubmit={handleDelete}
            onCancel={() => setDeleteDialog({ open: false, id: null })}
            submitButtonText={deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            disabled={deleteMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    ),
  };

  return (
    <HelmetWrapper
      title="Student Hostel | Seamless"
      heading="Student Hostel Management"
      subHeading="Manage student hostel assignments in Chatravas."
    >
      <DynamicTable
        data={getTableData(studentHostels).map(row => ({
          ...row,
          'Is Deleted': customRender['Is Deleted'](row['Is Deleted']),
          Delete: customRender.Delete('', row),
        }))}
        isLoading={isFetching}
        customRender={{}}
        onRowClick={() => {}}
        page={page}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={setLimit}
        total={totalCount}
        headerActions={
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="whitespace-nowrap w-full md:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Student Hostel
          </Button>
        }
      />

      {/* Create Student Hostel Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogTrigger asChild>
          <div />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Student Hostel</DialogTitle>
          </DialogHeader>
          <DynamicForm
            schema={createStudentHostelSchema}
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

export default StudentHostel;
