import { useRef, useState, useMemo } from 'react';
import {
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Download,
  Upload,
  Clock,
  Calendar,
  Target,
  BarChart3,
  FileSpreadsheet,
  Database,
  Activity,
  Zap,
} from 'lucide-react';
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
import { useSlots, useCreateSlot, useUpdateSlot, useDeleteSlot } from '@/hooks';
import { FieldType, FilterConfig } from '@/types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const getDefaultTimeRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return {
    start: new Date(today),
    end: new Date(today),
  };
};

const createSchema: FieldType[] = [
  { name: 'slot_id', label: 'Slot ID', type: 'text', required: true, columns: 2 },
  {
    name: 'time',
    label: 'Time Slot',
    type: 'timerange',
    required: true,
    columns: 2,
  },
  {
    name: 'day',
    label: 'Day',
    type: 'select',
    required: true,
    columns: 2,
    options: DAYS,
  },
];

const editSchema: FieldType[] = [
  {
    name: 'time',
    label: 'Time Slot',
    type: 'timerange',
    required: true,
    columns: 2,
  },
  {
    name: 'day',
    label: 'Day',
    type: 'select',
    required: true,
    columns: 2,
    options: DAYS,
  },
];

const formatTimeRange = (range: { start?: Date; end?: Date }) => {
  if (!range?.start || !range?.end) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  const format = (d: Date) => {
    let h = d.getHours();
    const m = pad(d.getMinutes());
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${pad(h)}:${m}${ampm}`;
  };
  return `${format(range.start)} - ${format(range.end)}`;
};

const parseTimeRange = (timeStr: string) => {
  // Expects format: "hh:mmAM/PM - hh:mmAM/PM"
  if (!timeStr || typeof timeStr !== 'string') return { start: undefined, end: undefined };
  const [startStr, endStr] = timeStr.split(' - ');
  const parse = (str: string) => {
    const match = str.match(/(\d{1,2}):(\d{2})(AM|PM)/i);
    if (!match) return undefined;
    const [_, h, m, ampm] = match;
    let hour = parseInt(h, 10);
    if (ampm.toUpperCase() === 'PM' && hour !== 12) hour += 12;
    if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;
    const date = new Date();
    date.setHours(hour, parseInt(m, 10), 0, 0);
    return date;
  };
  return {
    start: parse(startStr),
    end: parse(endStr),
  };
};

const csvTemplate = 'slot_id,day,time\n';

const SlotsManagement = () => {
  const { data: slots = [], isFetching } = useSlots();
  const createMutation = useCreateSlot();
  const updateMutation = useUpdateSlot();
  const deleteMutation = useDeleteSlot();

  const [editSlot, setEditSlot] = useState<any | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate statistics
  const totalSlots = slots.length;
  const slotsByDay = useMemo(() => {
    const counts: Record<string, number> = {};
    DAYS.forEach(day => {
      counts[day] = slots.filter(slot => slot.day === day).length;
    });
    return counts;
  }, [slots]);
  const activeDays = Object.values(slotsByDay).filter(count => count > 0).length;
  const mostActiveDay = Object.entries(slotsByDay).reduce(
    (max, [day, count]) => (count > max.count ? { day, count } : max),
    { day: 'None', count: 0 }
  );

  const handleEdit = (slot: any) => setEditSlot(slot);

  const handleUpdate = async (formData: Record<string, any>) => {
    if (!editSlot) return;
    await updateMutation.mutateAsync({
      slot_id: editSlot.slot_id,
      payload: {
        time: typeof formData.time === 'string' ? formData.time : formatTimeRange(formData.time),
        day: formData.day,
      },
    });
    toast({ title: 'Slot updated successfully' });
    setEditSlot(null);
  };

  const handleCreate = async (formData: Record<string, any>) => {
    await createMutation.mutateAsync({
      slot_id: formData.slot_id,
      time: typeof formData.time === 'string' ? formData.time : formatTimeRange(formData.time),
      day: formData.day,
    });
    toast({ title: 'Slot created successfully' });
    setCreateDialogOpen(false);
  };

  const handleDelete = async (slot_id: string) => {
    await deleteMutation.mutateAsync(slot_id);
    toast({ title: 'Slot deleted successfully' });
  };

  // Download CSV template
  const handleDownloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'slots_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle CSV import
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async event => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(Boolean);
      const [header, ...rows] = lines;
      const headers = header.split(',').map(h => h.trim());
      const importedSlots = rows.map(row => {
        const values = row.split(',').map(v => v.trim());
        const slot: any = {};
        headers.forEach((h, i) => {
          slot[h] = values[i];
        });
        return slot;
      });
      // Bulk create slots (in parallel, and wait for all)
      await Promise.all(
        importedSlots
          .filter(slot => slot.slot_id && slot.day && slot.time)
          .map(slot =>
            createMutation.mutateAsync({
              slot_id: slot.slot_id,
              day: slot.day,
              time: slot.time,
            })
          )
      );
      toast({ title: 'Slots imported successfully' });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

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
          handleDelete(row._row.slot_id);
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
    Day: (value: string) => {
      const dayColors: Record<string, string> = {
        Monday:
          'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
        Tuesday:
          'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
        Wednesday:
          'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
        Thursday:
          'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
        Friday:
          'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
        Saturday:
          'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800',
        Sunday:
          'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800',
      };
      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${dayColors[value] || 'bg-gray-100 text-gray-700'}`}
        >
          {value}
        </span>
      );
    },
  };

  const getTableData = (slots: any[]) =>
    slots.map(slot => ({
      Time: slot.time,
      Slot: slot.slot_id,
      Day: slot.day,
      Edit: '',
      Delete: '',
      _row: { ...slot },
    }));

  const filterConfig: FilterConfig[] = [
    {
      column: 'Day',
      type: 'multi-select',
      options: DAYS,
    },
  ];

  if (isFetching && slots.length === 0) {
    return (
      <HelmetWrapper
        title="Slots | Seamless"
        heading="Time Slot Management"
        subHeading="Comprehensive scheduling system for academic time slots"
      >
        <div className="flex justify-center items-center h-96 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading time slot data...</p>
          </div>
        </div>
      </HelmetWrapper>
    );
  }

  return (
    <HelmetWrapper
      title="Slots | Seamless"
      heading="Time Slot Management"
      subHeading="Comprehensive scheduling system for academic time slots with efficient bulk management capabilities"
    >
      <div className="space-y-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                  Total Slots
                </p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalSlots}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
                  Active Days
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {activeDays}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
                  Most Active Day
                </p>
                <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                  {mostActiveDay.day}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  {mostActiveDay.count} slots
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl p-6 border-2 border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-1">
                  Avg per Day
                </p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {activeDays > 0 ? Math.round(totalSlots / activeDays) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Distribution */}
        <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Weekly Distribution</h3>
              <p className="text-sm text-muted-foreground">Time slot allocation across the week</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {DAYS.map(day => (
              <div
                key={day}
                className="bg-background rounded-xl p-4 border border-border shadow-sm"
              >
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">{day.slice(0, 3)}</div>
                  <div className="text-xl font-bold text-foreground">{slotsByDay[day]}</div>
                  <div className="text-xs text-muted-foreground">slots</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Management Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Quick Actions</h3>
                <p className="text-sm text-muted-foreground">Manage time slots efficiently</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <Plus className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">
                  Create individual slots with time range picker
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <Pencil className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Edit slot timings and day assignments</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-info rounded-xl flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Bulk Operations</h3>
                <p className="text-sm text-muted-foreground">Import/export slot data</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <Download className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Download CSV template for bulk import</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <Upload className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Import multiple slots from CSV file</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Slots Table Container */}
        <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              Time Slot Directory
            </h2>
            <p className="text-muted-foreground mt-2">
              Comprehensive management of academic time slots with color-coded day indicators and
              bulk import capabilities
            </p>
          </div>

          <div className="p-6">
            <DynamicTable
              tableHeading="Slots"
              data={getTableData(slots)}
              customRender={customRender}
              filterConfig={filterConfig}
              isLoading={isFetching || createMutation.isPending || updateMutation.isPending}
              headerActions={
                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Slot
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gradient-to-br from-background to-muted/20 border-2 border-border">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                          <Plus className="w-6 h-6 text-primary" />
                          Create New Time Slot
                        </DialogTitle>
                      </DialogHeader>
                      <DynamicForm
                        schema={createSchema}
                        defaultValues={{
                          time: getDefaultTimeRange(),
                        }}
                        onSubmit={handleCreate}
                        onCancel={() => setCreateDialogOpen(false)}
                        submitButtonText="Create Slot"
                      />
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    onClick={handleDownloadTemplate}
                    className="border-2 border-border hover:bg-muted/50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    CSV Template
                  </Button>

                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import CSV
                  </Button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleImportCSV}
                  />
                </div>
              }
            />
          </div>
        </div>

        {/* Slot Management Guide */}
        <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-warning rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Slot Management Guide</h3>
              <p className="text-sm text-muted-foreground">
                Best practices for time slot configuration
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
                <Clock className="w-4 h-4 text-primary" />
                <div>
                  <span className="font-medium text-foreground">Time Format</span>
                  <p className="text-sm text-muted-foreground">
                    Use 12-hour format with AM/PM (e.g., 09:00AM - 10:30AM)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
                <Calendar className="w-4 h-4 text-primary" />
                <div>
                  <span className="font-medium text-foreground">Day Selection</span>
                  <p className="text-sm text-muted-foreground">
                    Choose from Monday to Sunday for each slot
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
                <FileSpreadsheet className="w-4 h-4 text-primary" />
                <div>
                  <span className="font-medium text-foreground">CSV Import</span>
                  <p className="text-sm text-muted-foreground">
                    Use template format: slot_id, day, time
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
                <Target className="w-4 h-4 text-primary" />
                <div>
                  <span className="font-medium text-foreground">Unique IDs</span>
                  <p className="text-sm text-muted-foreground">
                    Ensure each slot has a unique identifier
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Edit Dialog */}
      <Dialog
        open={!!editSlot}
        onOpenChange={open => {
          if (!open) setEditSlot(null);
        }}
      >
        <DialogContent className="bg-gradient-to-br from-background to-muted/20 border-2 border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Pencil className="w-6 h-6 text-primary" />
              Edit Time Slot
            </DialogTitle>
          </DialogHeader>
          <DynamicForm
            schema={editSchema}
            onSubmit={handleUpdate}
            // Set defaultValues with parsed time range for editing
            defaultValues={
              editSlot
                ? {
                    ...editSlot,
                    time:
                      typeof editSlot.time === 'string'
                        ? parseTimeRange(editSlot.time)
                        : editSlot.time,
                  }
                : undefined
            }
            onCancel={() => setEditSlot(null)}
            submitButtonText="Save Changes"
          />
        </DialogContent>
      </Dialog>
    </HelmetWrapper>
  );
};

export default SlotsManagement;
