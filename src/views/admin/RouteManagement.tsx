import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import DynamicTable from '@/components/DynamicTable';
import DynamicForm from '@/components/DynamicForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import HelmetWrapper from '@/components/HelmetWrapper';
import { useCreateRoute, useUpdateRoute, useDeleteRoute } from '@/hooks';
import { useRoles } from '@/hooks';
import { FieldType } from '@/types';
import { useSidebarItems } from '@/hooks';

const baseSchema: FieldType[] = [
  { name: 'path', label: 'Path', type: 'text', required: true, columns: 2 },
  { name: 'label', label: 'Label', type: 'text', required: true, columns: 2 },
  { name: 'icon', label: 'Icon', type: 'text', required: true, columns: 2 },
  { name: 'is_active', label: 'Active', type: 'toggle', columns: 2 },
  {
    name: 'module_id',
    label: 'Module ID',
    type: 'number',
    required: true,
    columns: 2,
    disabled: true,
  },
  {
    name: 'parent_id',
    label: 'Parent ID',
    type: 'number',
    required: false,
    columns: 2,
    disabled: true,
  },
];

const RouteManagement = () => {
  const { sidebarItems, isLoading: sidebarLoading } = useSidebarItems({ role: 'all' });
  const createMutation = useCreateRoute();
  const updateMutation = useUpdateRoute();
  const deleteMutation = useDeleteRoute();

  const { data: allRolesApi = [], isLoading: rolesLoading } = useRoles();

  const [editRoute, setEditRoute] = useState<any | null>(null);
  const [createDialogParent, setCreateDialogParent] = useState<{
    module_id: number;
    parent_id: number | null;
  } | null>(null);

  const allRoles = useMemo(
    () =>
      allRolesApi.map((role: any) => ({
        value: role.role_id,
        label: role.name,
      })),
    [allRolesApi]
  );

  const getSchema = (): FieldType[] => [
    ...baseSchema,
    {
      name: 'role_ids',
      label: 'Role IDs',
      type: 'select',
      multiSelect: true,
      required: false,
      columns: 2,
      options: allRoles,
      disabled: false,
    },
  ];

  const getSubModuleTableData = (subModules: any[]) =>
    subModules.map(sub => ({
      Label: sub.label,
      Path: sub.path || '',
      Icon: sub.icon,
      Active: sub.isActive,
      Roles: (sub.roles || []).map((role: any) => ({
        label: role.role_name || role.name || role.label || role,
        value: role.role_id || role.value || role,
      })),
      Edit: '',
      Delete: '',
      Create: '',
      _row: sub,
      _subModules: sub.children || [],
      _module_id: sub.module_id,
      _parent_id: sub.parent_id ?? null,
      _roles: sub.roles || [],
    }));

  const customRender = {
    Edit: (_: any, row: Record<string, any>) => (
      <Button
        size="icon"
        variant="ghost"
        onClick={e => {
          e.stopPropagation();
          setEditRoute({
            ...row._row,
            module_id: row._module_id,
            parent_id: row._parent_id,
            is_active: row._row.isActive,
            role_ids: (row._row.roles || []).map((r: any) => String(r.role_id)),
          });
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
          if (row._row && row._row.id) {
            deleteMutation.mutate(row._row.id);
            toast({ title: 'Route deleted' });
          }
        }}
        disabled={false}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    ),
    Create: (_: any, row: Record<string, any>) => (
      <Button
        size="icon"
        variant="outline"
        onClick={e => {
          e.stopPropagation();
          setCreateDialogParent({ module_id: row._module_id, parent_id: row._row.id });
        }}
        title="Add Child Route"
      >
        <Plus className="w-4 h-4" />
      </Button>
    ),
    Active: (value: boolean) => (
      <span className={value ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
        {value ? 'Active' : 'Inactive'}
      </span>
    ),
    Icon: (value: string) => (
      <span>
        <i className={value} /> {value}
      </span>
    ),
    Roles: (roles: { label: string; value: string }[]) => (
      <div className="flex flex-wrap gap-1">
        {roles && roles.length > 0 ? (
          roles.map(role => (
            <span
              key={role.value}
              className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium border border-blue-200"
            >
              {role.label}
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-xs">No Roles</span>
        )}
      </div>
    ),
  };

  const renderExpandedComponent = (row: Record<string, any>) => {
    if (!row._subModules || row._subModules.length === 0) return null;
    return (
      <DynamicTable
        data={getSubModuleTableData(row._subModules).map(childRow => ({
          ...childRow,
          Edit: customRender.Edit('', childRow),
          Delete: customRender.Delete('', childRow),
          Create: customRender.Create('', childRow),
          Icon: customRender.Icon(childRow.Icon),
        }))}
        customRender={customRender}
        className="bg-background"
        expandableRows={true}
        expandedComponent={renderExpandedComponent}
        disableSearch={true}
      />
    );
  };

  return (
    <HelmetWrapper title="Sidebar Modules | Seamless">
      <div className="max-w-5xl mx-auto p-6">
        {sidebarLoading || rolesLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          sidebarItems.map((mod: any) => (
            <div key={mod.id} className="mb-8">
              <h2 className="text-lg font-semibold mb-2 flex justify-between itec">
                {mod.label}
                <Button
                  size="sm"
                  className="ml-4"
                  onClick={() => {
                    setCreateDialogParent({ module_id: mod.id, parent_id: null });
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Route
                </Button>
              </h2>
              <DynamicTable
                data={getSubModuleTableData(mod.subModules || []).map(row => ({
                  ...row,
                  Edit: customRender.Edit('', row),
                  Delete: customRender.Delete('', row),
                  Create: customRender.Create('', row),
                  Icon: customRender.Icon(row.Icon),
                }))}
                customRender={customRender}
                className="bg-background"
                expandableRows={true}
                expandedComponent={renderExpandedComponent}
                disableSearch={true}
              />
            </div>
          ))
        )}

        {/* Create Route Dialog */}
        <Dialog
          open={!!createDialogParent}
          onOpenChange={open => {
            if (!open) setCreateDialogParent(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Route</DialogTitle>
            </DialogHeader>
            <DynamicForm
              schema={getSchema()}
              defaultValues={{
                module_id: createDialogParent?.module_id,
                parent_id: createDialogParent?.parent_id ?? '',
                role_ids: [],
              }}
              onSubmit={async (formData: Record<string, any>) => {
                if (!createDialogParent) return;
                await createMutation.mutateAsync({
                  path: formData.path,
                  label: formData.label,
                  icon: formData.icon,
                  is_active: !!formData.is_active,
                  module_id: Number(createDialogParent.module_id),
                  parent_id:
                    createDialogParent.parent_id !== null &&
                    createDialogParent.parent_id !== undefined
                      ? Number(createDialogParent.parent_id)
                      : null,
                  role_ids: Array.isArray(formData.role_ids)
                    ? formData.role_ids.map((id: string) => Number(id))
                    : typeof formData.role_ids === 'string'
                      ? formData.role_ids.split(',').map((id: string) => Number(id.trim()))
                      : [],
                });
                toast({ title: 'Route created' });
                setCreateDialogParent(null);
              }}
              onCancel={() => setCreateDialogParent(null)}
              submitButtonText="Create"
            />
          </DialogContent>
        </Dialog>

        {/* Edit Route Dialog */}
        <Dialog
          open={!!editRoute}
          onOpenChange={open => {
            if (!open) setEditRoute(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Route</DialogTitle>
            </DialogHeader>
            <DynamicForm
              schema={getSchema()}
              defaultValues={{
                ...editRoute,
                module_id: editRoute?.module_id ?? '',
                parent_id: editRoute?.parent_id ?? '',
                is_active: !!editRoute?.isActive,
                role_ids: Array.isArray(editRoute?.role_ids)
                  ? editRoute.role_ids.map(String)
                  : (editRoute?.roles || []).map((r: any) => String(r.role_id)),
              }}
              onSubmit={async (formData: Record<string, any>) => {
                if (!editRoute) return;
                await updateMutation.mutateAsync({
                  route_id: editRoute.id || editRoute.route_id,
                  payload: {
                    path: formData.path,
                    label: formData.label,
                    icon: formData.icon,
                    is_active: !!formData.is_active,
                    module_id: Number(editRoute.module_id),
                    parent_id:
                      editRoute.parent_id === null || editRoute.parent_id === undefined
                        ? null
                        : Number(editRoute.parent_id),
                    role_ids: Array.isArray(formData.role_ids)
                      ? formData.role_ids.map((id: string) => Number(id))
                      : typeof formData.role_ids === 'string'
                        ? formData.role_ids.split(',').map((id: string) => Number(id.trim()))
                        : [],
                  },
                });
                toast({ title: 'Route updated' });
                setEditRoute(null);
              }}
              onCancel={() => setEditRoute(null)}
              submitButtonText="Save"
            />
          </DialogContent>
        </Dialog>
      </div>
    </HelmetWrapper>
  );
};

export default RouteManagement;
