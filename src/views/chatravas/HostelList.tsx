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
import { useCreateHostel, useDeleteHostel, useHostels, useUpdateHostel } from '@/hooks';
import type { Hostel } from '@/types';
import { Loader2, Plus, Trash2, Pencil } from 'lucide-react';
import { useState, useMemo } from 'react';

const createHostelSchema = [
  { name: 'hostel_id', label: 'Hostel ID', type: 'text', required: true, columns: 2 },
  { name: 'hostel_name', label: 'Hostel Name', type: 'text', required: true, columns: 2 },
  { name: 'hostel_ldap', label: 'Hostel LDAP', type: 'text', required: true, columns: 2 },
  { name: 'incharge', label: 'Incharge', type: 'text', required: true, columns: 2 },
];

const editHostelSchema = [
  { name: 'hostel_name', label: 'Hostel Name', type: 'text', required: true, columns: 2 },
  { name: 'hostel_ldap', label: 'Hostel LDAP', type: 'text', required: true, columns: 2 },
  { name: 'incharge', label: 'Incharge', type: 'text', required: true, columns: 2 },
];

const HostelList = () => {
  const [search] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editHostel, setEditHostel] = useState<Hostel | null>(null);

  const { data, isFetching: isLoading } = useHostels({
    search,
    limit,
    offset: (page - 1) * limit,
  });
  const hostels: any = data ?? [];
  const totalCount = typeof data?.total_count === 'number' ? data.total_count : hostels.length;

  const createHostel = useCreateHostel();
  const updateHostel = useUpdateHostel();
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

  const handleEdit = (hostel: Hostel) => {
    setEditHostel(hostel);
  };

  const handleUpdate = async (formData: Record<string, any>) => {
    if (!editHostel) return;
    await updateHostel.mutateAsync({
      hostel_id: editHostel.hostel_id,
      payload: {
        hostel_name: formData.hostel_name,
        hostel_ldap: formData.hostel_ldap,
        incharge: formData.incharge,
      },
    });
    toast({ title: 'Hostel updated' });
    setEditHostel(null);
  };

  const handleDelete = (hostel_id: string) => {
    if (window.confirm('Delete this hostel?')) {
      deleteHostel.mutate(hostel_id, {
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
  };

  const getTableData = (hostels: Hostel[]) =>
    hostels.map(hostel => ({
      ID: hostel.hostel_id,
      Name: hostel.hostel_name,
      LDAP: hostel.hostel_ldap,
      Incharge: hostel.incharge,
      Edit: '',
      Delete: '',
      _row: hostel,
    }));

  const customRender = {
    Edit: (_: any, row: any) => (
      <Dialog
        open={editHostel?.hostel_id === row._row.hostel_id}
        onOpenChange={open => {
          if (!open) setEditHostel(null);
        }}
      >
        <DialogTrigger asChild>
          <Button size="icon" variant="ghost" onClick={() => handleEdit(row._row)}>
            <Pencil className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Hostel</DialogTitle>
          </DialogHeader>
          <DynamicForm
            schema={editHostelSchema}
            defaultValues={editHostel ?? undefined}
            onSubmit={handleUpdate}
            onCancel={() => setEditHostel(null)}
            submitButtonText={updateHostel.isPending ? 'Saving...' : 'Save'}
            disabled={updateHostel.isPending}
          />
        </DialogContent>
      </Dialog>
    ),
    Delete: (_: any, row: any) => (
      <Button
        size="icon"
        variant="destructive"
        onClick={e => {
          e.stopPropagation();
          handleDelete(row._row.hostel_id);
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

  // Filtered hostels for search summary
  const filteredHostels = useMemo(() => {
    if (!search.trim()) return hostels;
    return hostels.filter(
      (h: any) =>
        h.hostel_id.toLowerCase().includes(search.toLowerCase()) ||
        h.hostel_name.toLowerCase().includes(search.toLowerCase()) ||
        h.hostel_ldap.toLowerCase().includes(search.toLowerCase()) ||
        h.incharge.toLowerCase().includes(search.toLowerCase())
    );
  }, [hostels, search]);

  return (
    <HelmetWrapper
      title="Hostels | Seamless"
      heading="Hostel Management"
      subHeading="Manage hostels in the Chatravas module."
    >
      <DynamicTable
        data={getTableData(filteredHostels).map(row => ({
          ...row,
          Edit: customRender.Edit('', row),
          Delete: customRender.Delete('', row),
        }))}
        isLoading={isLoading}
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
            Add Hostel
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
