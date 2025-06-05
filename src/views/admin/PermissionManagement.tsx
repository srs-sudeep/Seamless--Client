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
import { Permission } from '@/types';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import DynamicTable from '@/components/DynamicTable';
import { type FilterConfig } from '@/types';
// import DynamicForm from '@/components/DynamicForm';

const PermissionManagement = () => {
  const { data: permissions = [], isLoading } = usePermissions();
  const updateMutation = useUpdatePermission();
  const deleteMutation = useDeletePermission();
  const createMutation = useCreatePermission();

  const [editPermission, setEditPermission] = useState<Permission | null>(null);
  const [groupByResource, setGroupByResource] = useState(false);

  // Form state for editing
  const [form, setForm] = useState({
    name: '',
    description: '',
    resource: '',
    action: '',
  });

  // Form state for creating
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    resource: '',
    action: '',
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Group permissions by resource
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
    setForm({
      name: perm.name,
      description: perm.description,
      resource: perm.resource,
      action: perm.action,
    });
  };

  const handleUpdate = async () => {
    if (!editPermission) return;
    await updateMutation.mutateAsync({
      permission_id: editPermission.permission_id,
      payload: form,
    });
    toast({ title: 'Permission updated' });
    setEditPermission(null);
  };

  const handleDelete = async (permission_id: number) => {
    await deleteMutation.mutateAsync(permission_id);
    toast({ title: 'Permission deleted' });
  };

  const handleCreate = async () => {
    await createMutation.mutateAsync(createForm);
    toast({ title: 'Permission created' });
    setCreateForm({ name: '', description: '', resource: '', action: '' });
    setCreateDialogOpen(false);
  };
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="permission-name">
                Name
              </label>
              <Input
                id="permission-name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="permission-description">
                Description
              </label>
              <Input
                id="permission-description"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="permission-resource">
                Resource
              </label>
              <Input
                id="permission-resource"
                value={form.resource}
                onChange={e => setForm(f => ({ ...f, resource: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="permission-action">
                Action
              </label>
              <div className="flex gap-2">
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value=""
                  onChange={e => {
                    const val = e.target.value;
                    if (val) setForm(f => ({ ...f, action: val }));
                  }}
                >
                  <option value="">Select</option>
                  <option value="read">read</option>
                  <option value="create">create</option>
                  <option value="update">update</option>
                  <option value="delete">delete</option>
                </select>
                <Input
                  id="permission-action"
                  value={form.action}
                  onChange={e => setForm(f => ({ ...f, action: e.target.value }))}
                  placeholder="Action (e.g. read)"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2 inline" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
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

  const filterConfig: FilterConfig[] = [
    {
      type: 'search',
      column: 'Name',
    },
    {
      type: 'dropdown',
      column: 'Action',
      options: ['read', 'create', 'update', 'delete'],
    },
    {
      type: 'date',
      column: 'Created At',
    },
  ];

  const schema = [
    { label: 'Username', name: 'username', type: 'text', required: true },
    { label: 'Password', name: 'password', type: 'password', required: true },
    { label: 'Bio', name: 'bio', type: 'textarea' },
    { label: 'Gender', name: 'gender', type: 'radio', options: ['Male', 'Female', 'Other'] },
    {
      label: 'Hobbies',
      name: 'hobbies',
      type: 'checkbox',
      options: ['Reading', 'Gaming', 'Traveling'],
    },
    { label: 'Country', name: 'country', type: 'select', options: ['India', 'USA', 'UK'] },
    { label: 'Birth Date', name: 'birthDate', type: 'date' },
    { label: 'Profile Picture', name: 'profilePic', type: 'file' },
  ];

  const handleSubmit = (data: Record<string, any>) => {
    console.log('Submitted:', data);
  };

  return (
    <HelmetWrapper title="Permissions | Seamless">
      {/* <DynamicForm schema={schema} onSubmit={handleSubmit} /> */}
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Permission Management</h1>
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
                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="create-permission-name"
                    >
                      Name
                    </label>
                    <Input
                      id="create-permission-name"
                      value={createForm.name}
                      onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="create-permission-description"
                    >
                      Description
                    </label>
                    <Input
                      id="create-permission-description"
                      value={createForm.description}
                      onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="create-permission-resource"
                    >
                      Resource
                    </label>
                    <Input
                      id="create-permission-resource"
                      value={createForm.resource}
                      onChange={e => setCreateForm(f => ({ ...f, resource: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="permission-action">
                      Action
                    </label>
                    <div className="flex gap-2">
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        value=""
                        onChange={e => {
                          const val = e.target.value;
                          if (val) setCreateForm(f => ({ ...f, action: val }));
                        }}
                      >
                        <option value="">Select</option>
                        <option value="read">read</option>
                        <option value="create">create</option>
                        <option value="update">update</option>
                        <option value="delete">delete</option>
                      </select>
                      <Input
                        id="permission-action"
                        value={createForm.action}
                        onChange={e => setCreateForm(f => ({ ...f, action: e.target.value }))}
                        placeholder="Action (e.g. read)"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreate} disabled={createMutation.isPending}>
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-2 inline" />
                        Creating...
                      </>
                    ) : (
                      'Create'
                    )}
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </DialogClose>
                </DialogFooter>
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
                filterConfig={filterConfig}
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
