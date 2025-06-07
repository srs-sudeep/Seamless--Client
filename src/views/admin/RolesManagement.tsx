import { HelmetWrapper } from '@/components';
import { Button } from '@/components';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components';
import { Sheet, SheetContent, SheetTitle } from '@/components';
import { toast } from '@/components';
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  usePermissionByRole,
  useAddPermissionToRole,
  useRemovePermissionFromRole,
} from '@/hooks';
import { FieldType } from '@/types';
import { Loader2, Pencil, Plus, Trash2, View } from 'lucide-react';
import { useState, JSX } from 'react';
import { DynamicTable } from '@/components';
import { DynamicForm } from '@/components';
import type { Role } from '@/types';

const schema: FieldType[] = [
  { name: 'name', label: 'Name', type: 'text', required: true, columns: 2 },
  { name: 'description', label: 'Description', type: 'text', required: true, columns: 2 },
];

type Permission = {
  resource: string;
  action: string;
  selected: boolean;
  [key: string]: any;
};

const RolesManagement = () => {
  const { data: roles = [], isLoading } = useRoles();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewPermissionRole, setViewPermissionRole] = useState<Role | null>(null);
  const { data: permissions = [], isLoading: permLoading } = usePermissionByRole(
    viewPermissionRole?.role_id
  );
  const addPermissionToRole = useAddPermissionToRole();
  const removePermissionFromRole = useRemovePermissionFromRole();

  // 1. Find all unique actions (excluding '*')
  const allActions: string[] = Array.from(
    new Set(
      permissions
        .map((perm: any) => perm.action)
        .filter((action: string) => action && action !== '*')
    )
  ) as string[];

  // 2. Group permissions by resources
  const resourceMap: Record<string, Record<string, Permission>> = {};
  (permissions as Permission[]).forEach(perm => {
    if (!resourceMap[perm.resource]) resourceMap[perm.resource] = {};
    resourceMap[perm.resource][perm.action] = perm;
  });

  // 3. Prepare permission table data for DynamicTable
  const permissionTableData = Object.keys(resourceMap).map(resource => {
    const wildcardPerm = resourceMap[resource]['*'];
    const row: Record<string, any> = { Resource: resource };
    allActions.forEach((action: string) => {
      const perm = resourceMap[resource][action];
      row[action] = {
        selected: !!wildcardPerm?.selected || !!perm?.selected,
        permission_id: perm?.permission_id, // <-- always set this if exists
        wildcard: !!wildcardPerm?.selected,
      };
    });
    return row;
  });

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
    toast('Role updated');
    setEditRole(null);
  };

  const handleDelete = async (role_id: number) => {
    await deleteMutation.mutateAsync(role_id);
    toast('Role deleted');
  };

  const handleCreate = async (formData: Record<string, any>) => {
    await createMutation.mutateAsync({
      name: formData.name,
      description: formData.description,
    });
    toast('Role created');
    setCreateDialogOpen(false);
  };

  // Custom render for toggles (dynamically for all actions)
  const permissionCustomRender = allActions.reduce<{
    [key: string]: (val: any, row: any) => JSX.Element;
  }>((acc, action: any) => {
    acc[action] = (val: any, row: any) => {
      const isLoading = addPermissionToRole.isPending || removePermissionFromRole.isPending;
      const disabled = val.wildcard || isLoading || !viewPermissionRole;
      return (
        <button
          type="button"
          className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-200 ${
            val.selected ? 'bg-green-500' : 'bg-gray-300'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={disabled}
          aria-pressed={!!val.selected}
          onClick={() => {
            if (disabled || !viewPermissionRole || !val.permission_id) return;
            if (val.selected) {
              removePermissionFromRole.mutate({
                role_id: viewPermissionRole.role_id,
                permission_id: val.permission_id,
              });
            } else {
              addPermissionToRole.mutate({
                role_id: viewPermissionRole.role_id,
                permission_id: val.permission_id,
              });
            }
          }}
        >
          <span
            className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-200 ${
              val.selected ? 'translate-x-5' : ''
            }`}
          />
        </button>
      );
    };
    return acc;
  }, {});

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
      <div className="flex justify-center items-center">
        <Button size="icon" variant="outline" onClick={() => setViewPermissionRole(role)}>
          <View className="w-4 h-4" />
        </Button>
      </div>
    ),
  };

  const getTableData = (roles: Role[]) =>
    roles.map(role => ({
      Name: role.name,
      RoleID: role.role_id,
      Description: role.description,
      'View Permission': '',
      Edit: '',
      Delete: '',
      _row: role,
    }));

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
              'View Permission': customRender.ViewPermission('', row._row),
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
          <SheetContent
            side="right"
            className="
      p-0
      fixed right-0 top-1/2 -translate-y-1/2
      h-auto rounded-lg shadow-lg bg-background
      min-h-[300px]
      flex flex-col justify-center
      w-full
      sm:w-[90vw]
      md:min-w-[60vw]
      lg:min-w-[70vw]
      max-w-2xl
      max-h-[80vh]
      overflow-y-auto
    "
          >
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4">
                Permissions for: {viewPermissionRole?.name}
              </h2>
              {permLoading ? (
                <div className="flex justify-center items-center h-20">
                  <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <DynamicTable
                    data={permissionTableData}
                    customRender={permissionCustomRender}
                    className="bg-background"
                    disableSearch
                  />
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </HelmetWrapper>
  );
};

export default RolesManagement;
