import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DynamicForm,
  DynamicTable,
  HelmetWrapper,
  Input,
  toast,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Popover,
  PopoverTrigger,
  PopoverContent,
  ScrollArea,
  Checkbox,
  Badge,
} from '@/components';
import { useCreateRoute, useDeleteRoute, useRoles, useSidebarItems, useUpdateRoute } from '@/hooks';
import { FieldType, FilterConfig } from '@/types';
import { Pencil, Plus, Trash2, Search, X, ChevronDownIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

const baseSchema: FieldType[] = [
  { name: 'path', label: 'Path', type: 'text', required: true, columns: 2 },
  { name: 'label', label: 'Label', type: 'text', required: true, columns: 2 },
  { name: 'icon', label: 'Icon', type: 'text', required: false, columns: 2 },
  { name: 'is_active', label: 'Active', type: 'toggle', columns: 1 },
  { name: 'is_sidebar', label: 'Is Sidebar', type: 'toggle', columns: 1 },
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
  const [globalSearch, setGlobalSearch] = useState('');

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
      Status: sub.isActive,
      Roles: (sub.roles || []).map((role: any) => ({
        label: role.role_name || role.name || role.label || role,
        value: role.role_id || role.value || role,
      })),
      'Is Sidebar': sub.is_sidebar,
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
      <Tooltip>
        <TooltipTrigger asChild>
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
        </TooltipTrigger>
        <TooltipContent>Edit Child Route</TooltipContent>
      </Tooltip>
    ),
    Delete: (_: any, row: Record<string, any>) => (
      <Tooltip>
        <TooltipTrigger asChild>
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
        </TooltipTrigger>
        <TooltipContent>Delete Route</TooltipContent>
      </Tooltip>
    ),
    Create: (_: any, row: Record<string, any>) => (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            onClick={e => {
              e.stopPropagation();
              setCreateDialogParent({ module_id: row._module_id, parent_id: row._row.id });
            }}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add Child Route</TooltipContent>
      </Tooltip>
    ),
    Status: (value: boolean) => (
      <span
        className={`px-2 py-0.5 rounded-full ${value ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}  text-xs font-medium border`}
      >
        {value ? 'Active' : 'Inactive'}
      </span>
    ),
    'Is Sidebar': (value: boolean) => (
      <span
        className={`px-2 py-0.5 rounded-full ${value ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-red-100 text-red-800 border-red-200'}  text-xs font-medium border `}
      >
        {String(value)}
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

  // Dropdown filter options
  const statusOptions = ['Active', 'Inactive'];
  const isSidebarOptions = ['true', 'false'];

  // Global filter state
  const [globalFilters, setGlobalFilters] = useState<{
    Status?: string;
    Roles?: string[];
    'Is Sidebar'?: string;
  }>({});

  // Prepare filterConfig for DynamicTable
  const filterConfig: FilterConfig[] = [
    {
      column: 'Roles',
      type: 'multi-select',
      options: allRoles.map(r => r.label),
    },
  ];

  // Recursive filter function for submodules
  const filterTableData = (data: any[]): any[] => {
    return data
      .map(row => {
        // Recursively filter children
        let filteredChildren = [];
        if (Array.isArray(row._subModules) && row._subModules.length > 0) {
          filteredChildren = filterTableData(row._subModules);
        }

        // Filtering logic for this row
        let matches = true;
        if (globalFilters.Status) {
          const statusValue = row.Status ? 'Active' : 'Inactive';
          if (statusValue !== globalFilters.Status) matches = false;
        }
        if (globalFilters['Is Sidebar']) {
          if (String(row['Is Sidebar']) !== globalFilters['Is Sidebar']) matches = false;
        }
        if (
          globalFilters.Roles &&
          Array.isArray(globalFilters.Roles) &&
          globalFilters.Roles.length > 0
        ) {
          const rowRoles = (row.Roles || []).map((r: any) => r.label);
          if (!globalFilters.Roles.some((role: string) => rowRoles.includes(role))) matches = false;
        }

        // Keep row if it matches or has matching children
        if (matches || filteredChildren.length > 0) {
          return {
            ...row,
            _subModules: filteredChildren,
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  // Filtered sidebarItems based on global search
  const filteredSidebarItems = useMemo(() => {
    if (!globalSearch.trim()) return sidebarItems;
    const search = globalSearch.toLowerCase();
    // Filter modules and their submodules
    return sidebarItems
      .map((mod: any) => {
        const filteredSubModules = (mod.subModules || []).filter(
          (sub: any) =>
            (sub.label || '').toLowerCase().includes(search) ||
            (sub.path || '').toLowerCase().includes(search) ||
            (sub.icon || '').toLowerCase().includes(search) ||
            (sub.roles || []).some((role: any) =>
              (role.role_name || role.name || role.label || '').toLowerCase().includes(search)
            )
        );
        if (mod.label.toLowerCase().includes(search) || filteredSubModules.length > 0) {
          return { ...mod, subModules: filteredSubModules };
        }
        return null;
      })
      .filter(Boolean);
  }, [sidebarItems, globalSearch]);

  // Render global filters (remove badges from inside the role filter)
  const renderGlobalFilters = () => (
    <div className="flex flex-wrap md:flex-nowrap gap-4 items-center">
      {/* Search Bar */}
      <div className="relative flex-1 w-full min-w-[250px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Search routes by label, path, icon, or role..."
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
      {/* Status Filter */}
      <div className="min-w-[180px]">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full flex justify-between items-center h-10">
              <span>{globalFilters.Status || 'Filter Status'}</span>
              <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2">
            <ScrollArea className="h-16">
              {statusOptions.map(opt => (
                <div
                  key={opt}
                  className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => {
                    setGlobalFilters(f => ({
                      ...f,
                      Status: f.Status === opt ? undefined : opt,
                    }));
                  }}
                >
                  <Checkbox
                    checked={globalFilters.Status === opt}
                    onCheckedChange={() => {
                      setGlobalFilters(f => ({
                        ...f,
                        Status: f.Status === opt ? undefined : opt,
                      }));
                    }}
                    className="mr-2"
                    tabIndex={-1}
                    aria-label={opt}
                  />
                  <span>{opt}</span>
                </div>
              ))}
            </ScrollArea>
            {globalFilters.Status && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full"
                onClick={() => setGlobalFilters(f => ({ ...f, Status: undefined }))}
              >
                Clear
              </Button>
            )}
          </PopoverContent>
        </Popover>
      </div>
      {/* Is Sidebar Filter */}
      <div className="min-w-[180px]">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full flex justify-between items-center h-10">
              <span>{globalFilters['Is Sidebar'] || 'Filter Is Sidebar'}</span>
              <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2">
            <ScrollArea className="h-16">
              {isSidebarOptions.map(opt => (
                <div
                  key={opt}
                  className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => {
                    setGlobalFilters(f => ({
                      ...f,
                      'Is Sidebar': f['Is Sidebar'] === opt ? undefined : opt,
                    }));
                  }}
                >
                  <Checkbox
                    checked={globalFilters['Is Sidebar'] === opt}
                    onCheckedChange={() => {
                      setGlobalFilters(f => ({
                        ...f,
                        'Is Sidebar': f['Is Sidebar'] === opt ? undefined : opt,
                      }));
                    }}
                    className="mr-2"
                    tabIndex={-1}
                    aria-label={opt}
                  />
                  <span>{opt}</span>
                </div>
              ))}
            </ScrollArea>
            {globalFilters['Is Sidebar'] && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full"
                onClick={() => setGlobalFilters(f => ({ ...f, 'Is Sidebar': undefined }))}
              >
                Clear
              </Button>
            )}
          </PopoverContent>
        </Popover>
      </div>
      {/* Roles Filter */}
      <div className="min-w-[180px]">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="min-w-[180px] flex justify-between items-center h-10"
            >
              <span>
                {globalFilters.Roles && globalFilters.Roles.length > 0
                  ? `Roles (${globalFilters.Roles.length})`
                  : 'Filter by Roles'}
              </span>
              <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2">
            <ScrollArea className="h-48">
              {allRoles.map(role => (
                <div
                  key={role.label}
                  className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => {
                    setGlobalFilters(prev => {
                      const prevRoles = prev.Roles || [];
                      return {
                        ...prev,
                        Roles: prevRoles.includes(role.label)
                          ? prevRoles.filter((r: string) => r !== role.label)
                          : [...prevRoles, role.label],
                      };
                    });
                  }}
                >
                  <Checkbox
                    checked={globalFilters.Roles?.includes(role.label) || false}
                    onCheckedChange={() => {
                      setGlobalFilters(prev => {
                        const prevRoles = prev.Roles || [];
                        return {
                          ...prev,
                          Roles: prevRoles.includes(role.label)
                            ? prevRoles.filter((r: string) => r !== role.label)
                            : [...prevRoles, role.label],
                        };
                      });
                    }}
                    className="mr-2"
                    tabIndex={-1}
                    aria-label={role.label}
                  />
                  <span>{role.label}</span>
                </div>
              ))}
            </ScrollArea>
            {globalFilters.Roles && globalFilters.Roles.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full"
                onClick={() => setGlobalFilters(f => ({ ...f, Roles: undefined }))}
              >
                Clear All
              </Button>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  // Render expanded component with recursive filtering
  const renderExpandedComponent = (row: Record<string, any>) => {
    if (!row._subModules || row._subModules.length === 0) return null;
    return (
      <DynamicTable
        data={filterTableData(getSubModuleTableData(row._subModules))}
        customRender={customRender}
        expandableRows={true}
        expandedComponent={renderExpandedComponent}
        rowExpandable={row => Array.isArray(row._subModules) && row._subModules.length > 0}
        disableSearch={true}
        filterConfig={filterConfig}
      />
    );
  };

  return (
    <HelmetWrapper
      title="Paths | Seamless"
      heading="Path Management"
      subHeading="Manage application paths and their access control."
    >
      {/* Global Search Bar and Filters in a single row */}
      <div className="mx-6 mt-3 mb-6">
        <div className="rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 transition-all duration-300">
          {renderGlobalFilters()}
          {/* Selected Roles as Badges below the whole search/filter panel */}
          {globalFilters.Roles && globalFilters.Roles.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {globalFilters.Roles.map(role => (
                <Badge key={role} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                  <span>{role}</span>
                  <button
                    className="ml-1 text-xs text-gray-500 hover:text-red-500"
                    onClick={e => {
                      e.stopPropagation();
                      setGlobalFilters(prev => ({
                        ...prev,
                        Roles: (prev.Roles || []).filter((r: string) => r !== role) || undefined,
                      }));
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto p-6">
        {filteredSidebarItems.map((mod: any) => (
          <div key={mod.id} className="mb-8">
            <DynamicTable
              tableHeading={mod.label}
              data={filterTableData(getSubModuleTableData(mod.subModules || []))}
              customRender={customRender}
              expandableRows={true}
              expandedComponent={renderExpandedComponent}
              rowExpandable={row => Array.isArray(row._subModules) && row._subModules.length > 0}
              loading={sidebarLoading || rolesLoading}
              headerActions={
                <Button
                  size="sm"
                  className="ml-4"
                  onClick={() => {
                    setCreateDialogParent({ module_id: mod.id, parent_id: null });
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Route
                </Button>
              }
              onRowClick={() => {}}
              filterConfig={filterConfig}
            />
          </div>
        ))}
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
                    is_sidebar: !!formData.is_sidebar,
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
                  is_sidebar: !!formData.is_sidebar,
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
      </div>
    </HelmetWrapper>
  );
};

export default RouteManagement;
