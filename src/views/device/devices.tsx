import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DynamicForm,
  DynamicTable,
  HelmetWrapper,
  toast,
} from '@/components';
import { useDeleteDevice, useDevices, useServices, useUpdateDevice } from '@/hooks';
import type { Device, FilterConfig } from '@/types';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

const DevicesManagement = () => {
  const { data: devices = [], isFetching } = useDevices();
  const updateMutation = useUpdateDevice();
  const deleteMutation = useDeleteDevice();
  const { data: allServices = [] } = useServices();
  const [editDevice, setEditDevice] = useState<Device | null>(null);
  const serviceOptions = useMemo(
    () =>
      allServices.map(service => ({
        label: service.name,
        value: String(service.id),
      })),
    [allServices]
  );

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

  const customRender = {
    Status: (value: string) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          value === 'new'
            ? 'px-2 py-0.5 rounded-full text-xs font-medium border bg-chip-blue/10 border-chip-blue text-chip-blue'
            : value === 'approved'
              ? 'px-2 py-0.5 rounded-full text-xs font-medium border bg-success/10 border-success text-success'
              : 'px-2 py-0.5 rounded-full text-xs font-medium border bg-muted-foreground/10 border-muted-foreground text-muted-foreground'
        }`}
      >
        {value}
      </span>
    ),
    'Service Ids': (value: string[] = []) => (
      <div className="flex flex-wrap gap-1">
        {value.length === 0 ? (
          <span className="text-xs text-muted-foreground">None</span>
        ) : (
          value.map((name, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-full text-xs font-medium border bg-chip-purple/10 border-chip-purple text-chip-purple"
            >
              {name}
            </span>
          ))
        )}
      </div>
    ),
    token: (value: string) => (
      <div className="flex items-center">
        <span
          title={value}
          className="max-w-[120px] inline-block overflow-hidden text-ellipsis whitespace-nowrap"
        >
          {value}
        </span>
      </div>
    ),
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
      'Service Ids': deviceData.service_ids.map(
        id => serviceOptions.find(opt => opt.value === id)?.label || id
      ),
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
  const filterConfig: FilterConfig[] = [
    {
      column: 'Status',
      type: 'dropdown',
      options: Array.from(new Set(devices.map(d => d.device.status))).sort(),
    },
    {
      column: 'Service Ids',
      type: 'dropdown',
      options: serviceOptions.map(opt => opt.label),
    },
  ];

  return (
    <HelmetWrapper
      title="Devices | Seamless"
      heading="Device Management"
      subHeading="Manage all devices and their assigned services."
    >
      <DynamicTable
        data={getTableData(devices).map(row => ({
          ...row,
          Token: customRender.token(row.Token),
          Edit: customRender.Edit('', row),
          Delete: customRender.Delete('', row),
        }))}
        customRender={customRender}
        filterConfig={filterConfig}
        isLoading={isFetching}
      />
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
    </HelmetWrapper>
  );
};

export default DevicesManagement;
