import {
  Badge,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DynamicForm,
  DynamicTable,
  HelmetWrapper,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  toast,
} from '@/components';
import { useDeleteDevice, useDevices, useServices, useUpdateDevice } from '@/hooks';
import type { Device } from '@/types';
import { Loader2, Pencil, Plus, Search, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

const DevicesManagement = () => {
  const { data: devices = [], isLoading } = useDevices();
  const updateMutation = useUpdateDevice();
  const deleteMutation = useDeleteDevice();
  const { data: allServices = [], isLoading: isLoadingServices } = useServices();

  // Filter states
  const [editDevice, setEditDevice] = useState<Device | null>(null);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [serviceFilters, setServiceFilters] = useState<string[]>([]);
  const [globalSearch, setGlobalSearch] = useState('');

  // Extract all unique statuses from devices
  const availableStatuses = useMemo(() => {
    const statuses = new Set<string>();
    devices.forEach(device => {
      if (device.device.status) {
        statuses.add(device.device.status);
      }
    });
    return Array.from(statuses).sort();
  }, [devices]);

  // Format service options for multiselect dropdown
  const serviceOptions = useMemo(
    () =>
      allServices.map(service => ({
        label: service.name,
        value: String(service.id),
      })),
    [allServices]
  );

  // Apply filters to devices
  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      // Status filter
      if (statusFilters.length > 0 && !statusFilters.includes(device.device.status)) {
        return false;
      }

      // Service filter
      if (serviceFilters.length > 0) {
        const deviceServices = device.service_ids || [];
        if (!serviceFilters.some(id => deviceServices.includes(id))) {
          return false;
        }
      }

      // Global search
      if (globalSearch) {
        const searchLower = globalSearch.toLowerCase();
        return (
          device.device.device_id.toLowerCase().includes(searchLower) ||
          device.device.status.toLowerCase().includes(searchLower) ||
          device.device.token.toLowerCase().includes(searchLower) ||
          device.device.ip.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [devices, statusFilters, serviceFilters, globalSearch]);

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

  // Helper component to fetch and display service name
  const ServiceName = ({ id }: { id: string }) => {
    if (isLoadingServices) return <span className="text-xs text-gray-400">Loading...</span>;
    const service = allServices.find((s: any) => s.id === id);
    return <span>{service?.name || id}</span>;
  };

  const customRender = {
    status: (value: string) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          value === 'new'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
            : value === 'approved'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }`}
      >
        {value}
      </span>
    ),
    service_ids: (value: string[] = []) => (
      <div className="flex flex-wrap gap-1">
        {value.length === 0 ? (
          <span className="text-xs text-gray-400 dark:text-gray-500">None</span>
        ) : (
          value.map((id, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 rounded-full text-xs"
            >
              <ServiceName id={id} />
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
    <HelmetWrapper
      title="Devices | Seamless"
      heading="Device Management"
      subHeading="Manage all devices and their assigned services."
    >
      {/* Filter and Search Card */}
      <div className="mx-6 mt-3 mb-6">
        <div className="rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 transition-all duration-300">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Status Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="min-w-[150px] flex justify-between items-center"
                >
                  <span>
                    {statusFilters.length === 0
                      ? 'Filter by Status'
                      : `Status (${statusFilters.length})`}
                  </span>
                  <SlidersHorizontal className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <ScrollArea className="h-48">
                  {availableStatuses.map(status => (
                    <div
                      key={status}
                      className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => {
                        setStatusFilters(prev =>
                          prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
                        );
                      }}
                    >
                      <Checkbox
                        checked={statusFilters.includes(status)}
                        onCheckedChange={() => {
                          setStatusFilters(prev =>
                            prev.includes(status)
                              ? prev.filter(s => s !== status)
                              : [...prev, status]
                          );
                        }}
                        className="mr-2"
                        tabIndex={-1}
                      />
                      <span className="capitalize">{customRender.status(status)}</span>
                    </div>
                  ))}
                </ScrollArea>
                {statusFilters.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => setStatusFilters([])}
                  >
                    Clear All
                  </Button>
                )}
              </PopoverContent>
            </Popover>

            {/* Services Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="min-w-[150px] flex justify-between items-center"
                >
                  <span>
                    {serviceFilters.length === 0
                      ? 'Filter by Service'
                      : `Services (${serviceFilters.length})`}
                  </span>
                  <SlidersHorizontal className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <ScrollArea className="h-48">
                  {serviceOptions.map(service => (
                    <div
                      key={service.value}
                      className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => {
                        setServiceFilters(prev =>
                          prev.includes(service.value)
                            ? prev.filter(s => s !== service.value)
                            : [...prev, service.value]
                        );
                      }}
                    >
                      <Checkbox
                        checked={serviceFilters.includes(service.value)}
                        onCheckedChange={() => {
                          setServiceFilters(prev =>
                            prev.includes(service.value)
                              ? prev.filter(s => s !== service.value)
                              : [...prev, service.value]
                          );
                        }}
                        className="mr-2"
                        tabIndex={-1}
                      />
                      <span>{service.label}</span>
                    </div>
                  ))}
                </ScrollArea>
                {serviceFilters.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => setServiceFilters([])}
                  >
                    Clear All
                  </Button>
                )}
              </PopoverContent>
            </Popover>

            {/* Selected Filters as Badges */}
            <div className="flex flex-wrap gap-2">
              {statusFilters.map(status => (
                <Badge
                  key={status}
                  variant="secondary"
                  className="flex items-center gap-1 px-2 py-1"
                >
                  <span className="capitalize">{status}</span>
                  <button
                    className="ml-1 text-xs text-gray-500 hover:text-red-500"
                    onClick={e => {
                      e.stopPropagation();
                      setStatusFilters(prev => prev.filter(s => s !== status));
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {serviceFilters.map(serviceId => {
                const serviceName =
                  serviceOptions.find(s => s.value === serviceId)?.label || serviceId;
                return (
                  <Badge
                    key={serviceId}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    <span>{serviceName}</span>
                    <button
                      className="ml-1 text-xs text-gray-500 hover:text-red-500"
                      onClick={e => {
                        e.stopPropagation();
                        setServiceFilters(prev => prev.filter(s => s !== serviceId));
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>

            {/* Global Search */}
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search devices..."
                value={globalSearch}
                onChange={e => setGlobalSearch(e.target.value)}
                className="pl-10 pr-10 py-2 h-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
              />
              {globalSearch && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setGlobalSearch('')}
                    className="h-6 w-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <Button
              onClick={() => {
                // You could add a create device function here
                toast({ title: 'Add Device functionality would go here' });
              }}
              className="whitespace-nowrap w-full md:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Device
            </Button>
          </div>

          {/* Filter summary */}
          {(statusFilters.length > 0 || serviceFilters.length > 0 || globalSearch) && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
                  <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {filteredDevices.length === 0
                    ? 'No devices match your filters.'
                    : `Found ${filteredDevices.length} device${filteredDevices.length !== 1 ? 's' : ''} matching your criteria.`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          <DynamicTable
            data={getTableData(filteredDevices).map(row => ({
              ...row,
              Status: customRender.status(row.Status),
              Token: customRender.token(row.Token),
              'Service IDs': customRender.service_ids(row['Service IDs']),
              Edit: customRender.Edit('', row),
              Delete: customRender.Delete('', row),
            }))}
            customRender={customRender}
            disableSearch={true}
            loading={isLoading}
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
