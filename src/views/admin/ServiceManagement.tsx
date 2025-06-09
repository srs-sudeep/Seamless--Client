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
import { useServices, useCreateService, useUpdateService, useDeleteService } from '@/hooks';
import type { Service } from '@/types';

const schema = [
  { name: 'name', label: 'Name', type: 'text', required: true, columns: 2 },
  { name: 'description', label: 'Description', type: 'text', required: true, columns: 2 },
  { name: 'active', label: 'Active', type: 'checkbox', required: true, columns: 2 },
  { name: 'health_url', label: 'Health URL', type: 'text', required: false, columns: 2 },
];

const ServiceManagement = () => {
  const { data: services = [], isLoading } = useServices();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const [editService, setEditService] = useState<Service | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleEdit = (service: Service) => setEditService(service);

  const handleUpdate = async (formData: Record<string, any>) => {
    if (!editService) return;
    await updateMutation.mutateAsync({
      service_id: editService.id,
      payload: {
        name: formData.name,
        description: formData.description,
        active: !!formData.active,
        health_url: formData.health_url,
      },
    });
    toast({ title: 'Service updated' });
    setEditService(null);
  };

  const handleDelete = async (service_id: number) => {
    await deleteMutation.mutateAsync(service_id);
    toast({ title: 'Service deleted' });
  };

  const handleCreate = async (formData: Record<string, any>) => {
    await createMutation.mutateAsync({
      id: formData.id,
      name: formData.name,
      description: formData.description,
      active: !!formData.active,
      health_url: formData.health_url,
    });
    toast({ title: 'Service created' });
    setCreateDialogOpen(false);
  };

  const getTableData = (services: Service[]) =>
    services.map(service => ({
      ID: service.id,
      Name: service.name,
      Description: service.description,
      Active: service.active,
      'Health URL': service.health_url,
      Edit: '',
      Delete: '',
      _row: {
        ...service,
      },
    }));

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
          handleDelete(row._row.id);
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
    active: (value: boolean) => (
      <span className={value ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
        {value ? 'Active' : 'Inactive'}
      </span>
    ),
    health_url: (value: string) => (
      <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
        {value}
      </a>
    ),
    ID: (value: string) => (
      <span
        title={value}
        style={{
          maxWidth: 80,
          display: 'inline-block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          verticalAlign: 'middle',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </span>
    ),
  };

  return (
    <HelmetWrapper title="Services | Seamless">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-end mb-6">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Service</DialogTitle>
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
            data={getTableData(services).map(row => ({
              ...row,
              ID: customRender.ID(String(row.ID)),
              Edit: customRender.Edit('', row._row),
              Delete: customRender.Delete('', row._row),
              Active: customRender.active(row.Active),
              'Health URL': customRender.health_url(row['Health URL']),
            }))}
            customRender={customRender}
            className="bg-background"
          />
        )}
        <Dialog
          open={!!editService}
          onOpenChange={open => {
            if (!open) setEditService(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
            </DialogHeader>
            <DynamicForm
              schema={schema}
              onSubmit={handleUpdate}
              defaultValues={editService ?? undefined}
              onCancel={() => setEditService(null)}
              submitButtonText="Save"
            />
          </DialogContent>
        </Dialog>
      </div>
    </HelmetWrapper>
  );
};

export default ServiceManagement;
