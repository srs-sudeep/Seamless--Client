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
} from '@/components';
import { useCreateHostel, useDeleteHostel, useHostels } from '@/hooks/chatravas/useHostel.hook';
import type { Hostel } from '@/types/chatravas/hostel.types';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const createHostelSchema = [
  { name: 'hostel_id', label: 'Hostel ID', type: 'text', required: true },
  { name: 'hostel_name', label: 'Hostel Name', type: 'text', required: true },
  { name: 'hostel_ldap', label: 'Hostel LDAP', type: 'text', required: true },
  { name: 'incharge', label: 'Incharge', type: 'text', required: true },
];

const HostelList = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data, isFetching: isLoading } = useHostels({
    search,
    limit,
    offset: (page - 1) * limit,
  });
  const hostels: any = data ?? [];
  const totalCount = data?.total_count ?? 0;

  const createHostel = useCreateHostel();
  const deleteHostel = useDeleteHostel();

  const handleCreate = async (formData: Record<string, any>) => {
    const payload = {
      hostel_id: formData.hostel_id,
      hostel_name: formData.hostel_name,
      hostel_ldap: formData.hostel_ldap,
      incharge: formData.incharge,
    };
    createHostel.mutate(payload, {
      onSuccess: () => {
        toast({ title: 'Hostel created', description: 'The hostel was created successfully.' });
        setCreateDialogOpen(false);
      },
      onError: () =>
        toast({
          title: 'Failed to create hostel',
          description: 'An error occurred while creating the hostel.',
        }),
    });
  };

  const getTableData = (hostels: Hostel[]) =>
    hostels.map(hostel => ({
      ID: hostel.hostel_id,
      Name: hostel.hostel_name,
      LDAP: hostel.hostel_ldap,
      Incharge: hostel.incharge,
      Delete: '',
      _row: hostel,
    }));

  const customRender = {
    Delete: (_: any, row: any) => (
      <Button
        size="icon"
        variant="destructive"
        onClick={e => {
          e.stopPropagation();
          if (window.confirm('Delete this hostel?')) {
            deleteHostel.mutate(row._row.hostel_id, {
              onSuccess: () =>
                toast({
                  title: 'Hostel deleted',
                  description: 'The hostel was deleted successfully.',
                }),
              onError: () =>
                toast({
                  title: 'Failed to delete hostel',
                  description: 'An error occurred while deleting the hostel.',
                }),
            });
          }
        }}
        disabled={deleteHostel.isPending}
      >
        {deleteHostel.isPending ? (
          <Loader2 className="animate-spin w-4 h-4" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </Button>
    ),
  };

  return (
    <HelmetWrapper
      title="Hostels | Seamless"
      heading="Hostel Management"
      subHeading="Manage hostels in the Chatravas module."
    >
      <DynamicTable
        data={getTableData(hostels).map(row => ({
          ...row,
          Delete: customRender.Delete('', row),
        }))}
        isLoading={isLoading}
        customRender={{}}
        onRowClick={() => {}}
        onSearchChange={setSearch}
        page={page}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={setLimit}
        total={totalCount}
        headerActions={
          <Button className="flex items-center gap-2" onClick={() => setCreateDialogOpen(true)}>
            <Plus size={18} /> Add Hostel
          </Button>
        }
      />

      {/* Create Hostel Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogTrigger asChild>
          <div />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Hostel</DialogTitle>
          </DialogHeader>
          <DynamicForm
            schema={createHostelSchema}
            onSubmit={handleCreate}
            onCancel={() => setCreateDialogOpen(false)}
            submitButtonText={createHostel.isPending ? 'Creating...' : 'Create Hostel'}
            disabled={createHostel.isPending}
          />
        </DialogContent>
      </Dialog>
    </HelmetWrapper>
  );
};

export default HostelList;
