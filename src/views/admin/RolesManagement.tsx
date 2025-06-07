import HelmetWrapper from '@/components/HelmetWrapper';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { toast } from '@/components/ui/use-toast';
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  usePermissionByRole,
} from '@/hooks/core/useRole.hook';
import { FieldType } from '@/types';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import DynamicTable from '@/components/DynamicTable';
import DynamicForm from '@/components/DynamicForm';
import type { Role } from '@/types/core/rolesApi.types';
import { useIsMobile } from '@/hooks/use-mobile';

const schema: FieldType[] = [
  { name: 'name', label: 'Name', type: 'text', required: true, columns: 2 },
  { name: 'description', label: 'Description', type: 'text', required: true, columns: 2 },
];

const RolesManagement = () => {
  const { data: roles = [], isLoading } = useRoles();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();

  const [editRole, setEditRole] = useState<Role | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewPermissionRole, setViewPermissionRole] = useState<Role | null>(null);
  const isMobile = useIsMobile();

  const { data: permissions = [], isLoading: permLoading } = usePermissionByRole(
    viewPermissionRole?.role_id
  );

  // Group permissions by resource (excluding "*")
  const resourceMap: Record<string, Record<string, any>> = {};
  permissions.forEach((perm: any) => {
    if (!resourceMap[perm.resource]) resourceMap[perm.resource] = {};
    resourceMap[perm.resource][perm.action] = perm;
  });

  const actions = ['read', 'create', 'update', 'delete'];
  const actionLabels: Record<string, string> = {
    read: 'Read',
    create: 'Write',
    update: 'Edit',
    delete: 'Delete',
  };

  const handleEdit = (role: Role) => setEditRole(role);

  const handleUpdate = async (formData: Record<string, any>) => {
    if (!editRole) return;
    await updateMutation.mutateAsync({
      role_id: editRole.role_id,
      payload: {
        name: formData.name,
        description: formData.description,
      },
    });
    toast({ title: 'Role updated' });
    setEditRole(null);
  };

  const handleDelete = async (role_id: number) => {
    await deleteMutation.mutateAsync(role_id);
    toast({ title: 'Role deleted' });
  };

  const handleCreate = async (formData: Record<string, any>) => {
    await createMutation.mutateAsync({
      name: formData.name,
      description: formData.description,
    });
    toast({ title: 'Role created' });
    setCreateDialogOpen(false);
  };

  const customRender = {
    Edit: (_: any, role: Role) => (
      <Dialog
        open={editRole?.role_id === role.role_id}
        onOpenChange={open => {
          if (!open) setEditRole(null);
        }}
      >
        <DialogTrigger asChild>
          <Button size="icon" variant="ghost" onClick={() => handleEdit(role)}>
            <Pencil className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
          </DialogHeader>
          <DynamicForm
            schema={schema}
            onSubmit={handleUpdate}
            defaultValues={editRole ?? undefined}
            onCancel={() => setEditRole(null)}
            submitButtonText="Save"
          />
        </DialogContent>
      </Dialog>
    ),
    Delete: (_: any, role: Role) => (
      <Button
        size="icon"
        variant="destructive"
        onClick={() => handleDelete(role.role_id)}
        disabled={deleteMutation.isPending}
      >
        {deleteMutation.isPending ? (
          <Loader2 className="animate-spin w-4 h-4" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </Button>
    ),
    ViewPermission: (_: any, role: Role) => (
      <Button size="sm" variant="outline" onClick={() => setViewPermissionRole(role)}>
        View Permission
      </Button>
    ),
  };

  const getTableData = (roles: Role[]) =>
    roles.map(role => ({
      Name: role.name,
      RoleID: role.role_id,
      Description: role.description,
      ViewPermission: '',
      Edit: '',
      Delete: '',
      _row: role,
    }));

  // Prepare permission table data for DynamicTable
  const permissionTableData = Object.keys(resourceMap).map(resource => {
    const wildcardPerm = resourceMap[resource]['*'];
    return {
      Resource: resource,
      Read: { selected: wildcardPerm?.selected || resourceMap[resource]['read']?.selected },
      Write: { selected: wildcardPerm?.selected || resourceMap[resource]['create']?.selected },
      Edit: { selected: wildcardPerm?.selected || resourceMap[resource]['update']?.selected },
      Delete: { selected: wildcardPerm?.selected || resourceMap[resource]['delete']?.selected },
    };
  });

  // Custom render for toggles
  const permissionCustomRender = {
    Read: (val: any) => (
      <button
        type="button"
        className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-200 ${
          val.selected ? 'bg-green-500' : 'bg-gray-300'
        }`}
        disabled
        aria-pressed={!!val.selected}
      >
        <span
          className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-200 ${
            val.selected ? 'translate-x-5' : ''
          }`}
        />
      </button>
    ),
    Write: (val: any) => (
      <button
        type="button"
        className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-200 ${
          val.selected ? 'bg-green-500' : 'bg-gray-300'
        }`}
        disabled
        aria-pressed={!!val.selected}
      >
        <span
          className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-200 ${
            val.selected ? 'translate-x-5' : ''
          }`}
        />
      </button>
    ),
    Edit: (val: any) => (
      <button
        type="button"
        className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-200 ${
          val.selected ? 'bg-green-500' : 'bg-gray-300'
        }`}
        disabled
        aria-pressed={!!val.selected}
      >
        <span
          className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-200 ${
            val.selected ? 'translate-x-5' : ''
          }`}
        />
      </button>
    ),
    Delete: (val: any) => (
      <button
        type="button"
        className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-200 ${
          val.selected ? 'bg-green-500' : 'bg-gray-300'
        }`}
        disabled
        aria-pressed={!!val.selected}
      >
        <span
          className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-200 ${
            val.selected ? 'translate-x-5' : ''
          }`}
        />
      </button>
    ),
  };

  return (
    <HelmetWrapper title="Roles | Seamless">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-end mb-6">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Role</DialogTitle>
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
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          <DynamicTable
            data={getTableData(roles).map(row => ({
              ...row,
              ViewPermission: customRender.ViewPermission('', row._row),
              Edit: customRender.Edit('', row._row),
              Delete: customRender.Delete('', row._row),
            }))}
            customRender={{}}
            className="bg-background"
          />
        )}
        <Sheet
          open={!!viewPermissionRole}
          onOpenChange={open => !open && setViewPermissionRole(null)}
        >
          <SheetTitle style={{ display: 'none' }} />
          <SheetContent side={isMobile ? 'bottom' : 'right'} className="p-0 w-full max-w-md">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Permissions for: {viewPermissionRole?.name}
              </h2>
              {permLoading ? (
                <div className="flex justify-center items-center h-20">
                  <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
                </div>
              ) : (
                <DynamicTable
                  data={permissionTableData}
                  customRender={permissionCustomRender}
                  className="bg-background"
                  disableSearch
                />
              )}
              <Button className="mt-6" onClick={() => setViewPermissionRole(null)}>
                Close
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </HelmetWrapper>
  );
};

export default RolesManagement;
