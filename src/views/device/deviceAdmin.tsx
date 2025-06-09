import { useState } from 'react';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
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
import {
  useDeviceAdmins,
  useCreateDeviceAdmin,
  useUpdateDeviceAdmin,
  useDeleteDeviceAdmin,
} from '@/hooks';
import type { DeviceAdmin } from '@/types';

const createSchema = [
  { name: 'ldapid', label: 'LDAP ID', type: 'text', required: true, columns: 2 },
  { name: 'insti_id', label: 'Institute ID', type: 'text', required: true, columns: 2 },
];

const editSchema = [
  { name: 'insti_id', label: 'Institute ID', type: 'text', required: true, columns: 2 },
];

const DeviceAdminManagement = () => {
  const { data: admins = [], isLoading } = useDeviceAdmins();
  const createMutation = useCreateDeviceAdmin();
  const updateMutation = useUpdateDeviceAdmin();
  const deleteMutation = useDeleteDeviceAdmin();

  const [editAdmin, setEditAdmin] = useState<DeviceAdmin | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleEdit = (admin: DeviceAdmin) => setEditAdmin(admin);

  const handleUpdate = async (formData: Record<string, any>) => {
    if (!editAdmin) return;
    await updateMutation.mutateAsync({
      ldapid: editAdmin.ldapid,
      payload: {
        insti_id: formData.insti_id,
      },
    });
    toast({ title: 'Device Admin updated' });
    setEditAdmin(null);
  };

  const handleDelete = async (ldapid: string) => {
    await deleteMutation.mutateAsync(ldapid);
    toast({ title: 'Device Admin deleted' });
  };

  const handleCreate = async (formData: Record<string, any>) => {
    await createMutation.mutateAsync({
      payload: {
        ldapid: formData.ldapid,
        insti_id: formData.insti_id,
      },
    });
    toast({ title: 'Device Admin created' });
    setCreateDialogOpen(false);
  };

  const customRender = {
    Edit: (_: any, row: Record<string, any>) => (
      <Button
        size="icon"
        variant="ghost"
        onClick={e => {
          e.stopPropagation();
          handleEdit(row._row);
        }}
      >
        <Pencil className="w-4 h-4" />
      </Button>
    ),
    Delete: (_: any, row: Record<string, any>) => (
      <Button
        size="icon"
        variant="destructive"
        onClick={e => {
          e.stopPropagation();
          handleDelete(row._row.ldapid);
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
  };

  const getTableData = (admins: DeviceAdmin[]) =>
    admins.map(admin => ({
      'LDAP ID': admin.ldapid,
      'Institute ID': admin.insti_id,
      Edit: '',
      Delete: '',
      _row: admin,
    }));

  return (
    <HelmetWrapper title="Device Admins | Seamless">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-end mb-6">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Device Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Device Admin</DialogTitle>
              </DialogHeader>
              <DynamicForm
                schema={createSchema}
                onSubmit={handleCreate}
                onCancel={() => setCreateDialogOpen(false)}
                submitButtonText="Create"
              />
            </DialogContent>
          </Dialog>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          <DynamicTable
            data={getTableData(admins).map(row => ({
              ...row,
              Edit: customRender.Edit('', row._row),
              Delete: customRender.Delete('', row._row),
            }))}
            customRender={customRender}
            className="bg-background"
          />
        )}
        <Dialog
          open={!!editAdmin}
          onOpenChange={open => {
            if (!open) setEditAdmin(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Device Admin</DialogTitle>
            </DialogHeader>
            <DynamicForm
              schema={editSchema}
              onSubmit={handleUpdate}
              defaultValues={editAdmin ?? undefined}
              onCancel={() => setEditAdmin(null)}
              submitButtonText="Save"
            />
          </DialogContent>
        </Dialog>
      </div>
    </HelmetWrapper>
  );
};

export default DeviceAdminManagement;
