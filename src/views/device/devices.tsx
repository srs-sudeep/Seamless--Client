import { useState } from 'react';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import {
  DynamicForm,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DynamicTable,
  Button,
  toast,
  HelmetWrapper,
} from '@/components';
import { useDevices, useUpdateDevice, useDeleteDevice } from '@/hooks';
import { useServices } from '@/hooks';
import type { Device } from '@/types';

const DevicesManagement = () => {
  const { data: devices = [], isLoading } = useDevices();
  const updateMutation = useUpdateDevice();
  const deleteMutation = useDeleteDevice();

  const [editDevice, setEditDevice] = useState<Device | null>(null);

  // Fetch all services for the multi-select
  const { data: allServices = [] } = useServices();

  // Build options for the multi-select
  const serviceOptions = allServices.map(service => ({
    label: service.name,
    value: String(service.id),
  }));

  // Custom edit schema for the modal
  const editSchema = [
    {
      name: 'device_id',
      label: 'Device ID',
      type: 'text',
      required: true,
      columns: 2,
      disabled: true,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'text',
      required: true,
      columns: 2,
      disabled: true,
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${value === 'new' ? 'bg-blue-100 text-blue-800' : value === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
        >
          {value}
        </span>
      ),
    },
    { name: 'token', label: 'Token', type: 'text', required: true, columns: 2, disabled: true },
    { name: 'ip', label: 'IP', type: 'text', required: true, columns: 2, disabled: true },
    {
      name: 'service_ids',
      label: 'Services',
      type: 'select',
      multiSelect: true,
      required: false,
      columns: 2,
      options: serviceOptions,
    },
  ];

  const handleEdit = (device: Device) => setEditDevice(device);

  const handleUpdate = async (formData: Record<string, any>) => {
    if (!editDevice) return;
    // Only send the array of service IDs
    await updateMutation.mutateAsync({
      device_id: editDevice.device.device_id,
      payload: formData.service_ids || [],
    });
    toast({ title: 'Device services updated' });
    setEditDevice(null);
  };

  const handleDelete = async (device_id: string) => {
    await deleteMutation.mutateAsync(device_id);
    toast({ title: 'Device deleted' });
  };

  // Helper component to fetch and display service name
  const ServiceName = ({ id }: { id: string }) => {
    const { data: services = [], isLoading } = useServices();
    if (isLoading) return <span className="text-xs text-gray-400">Loading...</span>;
    const service = services.find((s: any) => s.id === id);
    return <span>{service?.name || id}</span>;
  };

  const customRender = {
    status: (value: string) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${value === 'new' ? 'bg-blue-100 text-blue-800' : value === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
      >
        {value}
      </span>
    ),
    service_ids: (value: string[] = []) => (
      <div className="flex flex-wrap gap-1">
        {value.length === 0 ? (
          <span className="text-xs text-gray-400">None</span>
        ) : (
          value.map((id, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-gray-200 rounded-full text-xs">
              <ServiceName id={id} />
            </span>
          ))
        )}
      </div>
    ),
    token: (value: string) => (
      <span
        title={value}
        style={{
          maxWidth: 120,
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
    Edit: (_: any, row: Record<string, any>) => (
      <Button
        size="icon"
        variant="ghost"
        onClick={e => {
          e.stopPropagation();
          handleEdit(row._row);
        }}
        // disabled={(row._row.device.status === 'approved')}
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
          handleDelete(row._row.device.device_id);
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

  const getTableData = (devices: Device[]) =>
    devices.map(deviceData => ({
      'Device ID': deviceData.device.device_id,
      Status: deviceData.device.status,
      Token: deviceData.device.token,
      IP: deviceData.device.ip,
      'Service IDs': deviceData.service_ids,
      Edit: '',
      Delete: '',
      _row: deviceData,
    }));

  // Prepare default values for the edit form
  const getEditDefaultValues = (device: Device) => ({
    device_id: device.device.device_id,
    status: device.device.status,
    token: device.device.token,
    ip: device.device.ip,
    service_ids: device.service_ids,
  });

  return (
    <HelmetWrapper title="Devices | Seamless">
      <div className="max-w-5xl mx-auto p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          <DynamicTable
            data={getTableData(devices).map(row => ({
              ...row,
              Status: customRender.status(row._row.device.status),
              Token: customRender.token(row._row.device.token),
              'Service IDs': customRender.service_ids(row._row.service_ids),
              Edit: customRender.Edit('', row._row),
              Delete: customRender.Delete('', row._row),
            }))}
            customRender={customRender}
            className="bg-background"
          />
        )}
        <Dialog
          open={!!editDevice}
          onOpenChange={open => {
            if (!open) setEditDevice(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Device Services</DialogTitle>
            </DialogHeader>
            <DynamicForm
              schema={editSchema}
              onSubmit={handleUpdate}
              defaultValues={editDevice ? getEditDefaultValues(editDevice) : undefined}
              onCancel={() => setEditDevice(null)}
              submitButtonText="Save"
            />
          </DialogContent>
        </Dialog>
      </div>
    </HelmetWrapper>
  );
};

export default DevicesManagement;
