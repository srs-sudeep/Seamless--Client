import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import DynamicTable from '@/components/DynamicTable';
import DynamicForm from '@/components/DynamicForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import HelmetWrapper from '@/components/HelmetWrapper';
import { useCreateRoute, useUpdateRoute, useDeleteRoute } from '@/hooks/core/useRoute.hook';
import { FieldType, Route } from '@/types';
import { useSidebarItems } from '@/hooks/useSidebar.hook';

const schema: FieldType[] = [
  { name: 'path', label: 'Path', type: 'text', required: true, columns: 2 },
  { name: 'label', label: 'Label', type: 'text', required: true, columns: 2 },
  { name: 'icon', label: 'Icon', type: 'text', required: true, columns: 2 },
  { name: 'is_active', label: 'Active', type: 'checkbox', required: true, columns: 2 },
  { name: 'module_id', label: 'Module ID', type: 'number', required: true, columns: 2 },
  { name: 'parent_id', label: 'Parent ID', type: 'number', required: false, columns: 2 },
  { name: 'role_ids', label: 'Role IDs', type: 'text', required: false, columns: 2 },
];

const RouteManagement = () => {
  const { sidebarItems, isLoading: sidebarLoading } = useSidebarItems();
  const createMutation = useCreateRoute();
  const updateMutation = useUpdateRoute();
  const deleteMutation = useDeleteRoute();

  const [editRoute, setEditRoute] = useState<Route | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editModule, setEditModule] = useState<any | null>(null);

  const handleEdit = (route: Route) => setEditRoute(route);

  const handleUpdate = async (formData: Record<string, any>) => {
    if (!editRoute) return;
    await updateMutation.mutateAsync({
      route_id: editRoute.route_id,
      payload: {
        path: formData.path,
        label: formData.label,
        icon: formData.icon,
        is_active: !!formData.is_active,
        module_id: Number(formData.module_id),
        parent_id: formData.parent_id ? Number(formData.parent_id) : null,
        role_ids:
          typeof formData.role_ids === 'string'
            ? formData.role_ids.split(',').map((id: string) => Number(id.trim()))
            : formData.role_ids,
      },
    });
    toast({ title: 'Route updated' });
    setEditRoute(null);
  };

  const handleDelete = async (route_id: number) => {
    await deleteMutation.mutateAsync(route_id);
    toast({ title: 'Route deleted' });
  };

  const handleCreate = async (formData: Record<string, any>) => {
    await createMutation.mutateAsync({
      path: formData.path,
      label: formData.label,
      icon: formData.icon,
      is_active: !!formData.is_active,
      module_id: Number(formData.module_id),
      parent_id: formData.parent_id ? Number(formData.parent_id) : null,
      role_ids:
        typeof formData.role_ids === 'string'
          ? formData.role_ids.split(',').map((id: string) => Number(id.trim()))
          : formData.role_ids,
    });
    toast({ title: 'Route created' });
    setCreateDialogOpen(false);
  };

  // Prepare table data for modules
  const getModuleTableData = (modules: any[]) =>
    modules.map(mod => ({
      Label: mod.label,
      Icon: mod.icon,
      Active: mod.isActive,
      Edit: '',
      Delete: '',
      _row: mod,
      _subModules: mod.subModules || [],
    }));

  // Prepare table data for submodules (for expandable rows)
  const getSubModuleTableData = (subModules: any[]) =>
    subModules.map(sub => ({
      Label: sub.label,
      Path: sub.path || '',
      Icon: sub.icon,
      Active: sub.isActive,
      Edit: '',
      Delete: '',
      _row: sub,
      _subModules: sub.children || [],
    }));

  // Custom renderers
  const customRender = {
    Edit: (_: any, row: Record<string, any>) => (
      <Button
        size="icon"
        variant="ghost"
        onClick={e => {
          e.stopPropagation();
          setEditModule(row._row);
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
          // Implement delete logic if needed
        }}
        disabled={false}
      >
        <Trash2 className="w-4 h-4" />
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
  };

  // Recursive expandedComponent for submodules
  const renderExpandedComponent = (row: Record<string, any>) => {
    if (!row._subModules || row._subModules.length === 0) return null;
    return (
      <DynamicTable
        data={getSubModuleTableData(row._subModules)}
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
        {sidebarLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          <DynamicTable
            data={getModuleTableData(sidebarItems)}
            customRender={customRender}
            className="bg-background"
            expandableRows={true}
            expandedComponent={renderExpandedComponent}
          />
        )}

        <div className="flex items-center justify-end mb-6">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Route
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Route</DialogTitle>
              </DialogHeader>
              <DynamicForm
                schema={schema}
                onSubmit={() => setCreateDialogOpen(false)}
                onCancel={() => setCreateDialogOpen(false)}
                submitButtonText="Create"
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Example edit dialog for module/submodule */}
        <Dialog
          open={!!editModule}
          onOpenChange={open => {
            if (!open) setEditModule(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Module/Submodule</DialogTitle>
            </DialogHeader>
            <DynamicForm
              schema={[
                { name: 'label', label: 'Label', type: 'text', required: true, columns: 2 },
                { name: 'icon', label: 'Icon', type: 'text', required: true, columns: 2 },
                { name: 'isActive', label: 'Active', type: 'checkbox', required: true, columns: 2 },
                { name: 'path', label: 'Path', type: 'text', required: false, columns: 2 },
              ]}
              onSubmit={() => setEditModule(null)}
              defaultValues={editModule ?? undefined}
              onCancel={() => setEditModule(null)}
              submitButtonText="Save"
            />
          </DialogContent>
        </Dialog>
      </div>
    </HelmetWrapper>
  );
};

export default RouteManagement;
