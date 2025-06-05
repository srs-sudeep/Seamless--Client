import HelmetWrapper from '@/components/HelmetWrapper';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import {
  useCreatePermission,
  useDeletePermission,
  usePermissions,
  useUpdatePermission,
} from '@/hooks';
import { FieldType, Permission } from '@/types';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import DynamicTable from '@/components/DynamicTable';
import DynamicForm from '@/components/DynamicForm';

const PermissionManagement = () => {
  const { data: permissions = [], isLoading } = usePermissions();
  const updateMutation = useUpdatePermission();
  const deleteMutation = useDeletePermission();
  const createMutation = useCreatePermission();

  const [editPermission, setEditPermission] = useState<Permission | null>(null);
  const [groupByResource, setGroupByResource] = useState(false);
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
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-end mb-6">
          <div className="flex gap-2">
            <Button
              variant={groupByResource ? 'default' : 'outline'}
              onClick={() => setGroupByResource(g => !g)}
            >
              {groupByResource ? 'Ungroup' : 'Group by Resource'}
            </Button>
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
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          Object.entries(grouped).map(([resource, perms]) => (
            <div key={resource} className="mb-8">
              {groupByResource && <h2 className="text-lg font-semibold mb-2">{resource}</h2>}
              <DynamicTable
                data={getTableData(perms).map(row => ({
                  ...row,
                  Edit: customRender.Edit('', row._row),
                  Delete: customRender.Delete('', row._row),
                }))}
                customRender={{}}
                className="bg-background"
              />
            </div>
          ))
        )}
      </div>
    </HelmetWrapper>
  );
};

export default PermissionManagement;
