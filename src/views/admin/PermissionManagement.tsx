import {} from '@/components';
import {} from '@/components/ui/button';
import {
  Dialog,
  HelmetWrapper,
  Button,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DynamicForm,
  DynamicTable,
  toast,
} from '@/components';
import {
  useCreatePermission,
  useDeletePermission,
  usePermissions,
  useUpdatePermission,
} from '@/hooks';
import { FieldType, Permission } from '@/types';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

const PermissionManagement = () => {
  const { data: permissions = [], isLoading } = usePermissions();
  const updateMutation = useUpdatePermission();
  const deleteMutation = useDeletePermission();
  const createMutation = useCreatePermission();

  const [editPermission, setEditPermission] = useState<Permission | null>(null);
  const [groupByResource] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const grouped = useMemo(() => {
    if (!groupByResource) return { All: permissions };
    return permissions.reduce<Record<string, Permission[]>>((acc, perm) => {
      acc[perm.resource] = acc[perm.resource] || [];
      acc[perm.resource].push(perm);
      return acc;
    }, {});
  }, [permissions, groupByResource]);

  const handleEdit = (perm: Permission) => {
    setEditPermission(perm);
  };

  const handleUpdate = async (formData: Record<string, any>) => {
    if (!editPermission) return;
    await updateMutation.mutateAsync({
      permission_id: editPermission.permission_id,
      payload: {
        name: formData.name,
        description: formData.description,
        resource: formData.resource,
        action: formData.action,
      },
    });
    toast({ title: 'Permission updated' });
    setEditPermission(null);
  };

  const handleDelete = async (permission_id: number) => {
    await deleteMutation.mutateAsync(permission_id);
    toast({ title: 'Permission deleted' });
  };

  const handleCreate = async (formData: Record<string, any>) => {
    const payload = {
      name: formData.name,
      description: formData.description,
      resource: formData.resource,
      action: formData.action,
    };
    createMutation.mutate(payload);
  };

  const schema: FieldType[] = [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      columns: 2,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      required: true,
      columns: 2,
    },
    {
      name: 'resource',
      label: 'Resource',
      type: 'text',
      required: true,
      columns: 2,
    },
    {
      name: 'action',
      label: 'Action',
      type: 'radio',
      required: true,
      columns: 2,
      options: ['read', 'create', 'update', 'delete'],
    },
  ];

  const customRender = {
    Edit: (_: any, perm: Permission) => (
      <Dialog
        open={editPermission?.permission_id === perm.permission_id}
        onOpenChange={open => {
          if (!open) setEditPermission(null);
        }}
      >
        <DialogTrigger asChild>
          <Button size="icon" variant="ghost" onClick={() => handleEdit(perm)}>
            <Pencil className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Permission</DialogTitle>
          </DialogHeader>
          <DynamicForm
            schema={schema}
            onSubmit={handleUpdate}
            defaultValues={editPermission ?? undefined}
            onCancel={() => setEditPermission(null)}
            submitButtonText="Save"
          />
        </DialogContent>
      </Dialog>
    ),
    Delete: (_: any, perm: Permission) => (
      <Button
        size="icon"
        variant="destructive"
        onClick={() => handleDelete(perm.permission_id)}
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

  const getTableData = (perms: Permission[]) =>
    perms.map(perm => ({
      Name: perm.name,
      PermissionID: perm.permission_id,
      Description: perm.description,
      Action: perm.action,
      Edit: '',
      Delete: '',
      _row: perm,
    }));

  return (
    <HelmetWrapper title="Permissions | Seamless">
      <div className="mx-auto p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          Object.entries(grouped).map(([resource, perms]) => (
            <div key={resource} className="mb-8">
              <DynamicTable
                data={getTableData(perms).map(row => ({
                  ...row,
                  Edit: customRender.Edit('', row._row),
                  Delete: customRender.Delete('', row._row),
                }))}
                customRender={{}}
                className="bg-background rounded-xl"
                tableHeading={resource} // <-- Pass resource as table heading
                headerActions={
                  <div className="flex gap-2">
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Permission
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Permission</DialogTitle>
                        </DialogHeader>
                        <DynamicForm
                          schema={schema}
                          onSubmit={handleCreate}
                          onCancel={() => setCreateDialogOpen(false)}
                          submitButtonText="Create"
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                }
              />
            </div>
          ))
        )}
      </div>
    </HelmetWrapper>
  );
};

export default PermissionManagement;
