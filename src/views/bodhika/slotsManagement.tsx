import { useRef, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2, Download, Upload } from 'lucide-react';
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
    toast({ title: 'Slot updated' });
    setEditSlot(null);
  };

  const handleCreate = async (formData: Record<string, any>) => {
    await createMutation.mutateAsync({
      slot_id: formData.slot_id,
      time: typeof formData.time === 'string' ? formData.time : formatTimeRange(formData.time),
      day: formData.day,
    });
    toast({ title: 'Slot created' });
    setCreateDialogOpen(false);
  };

  const handleDelete = async (slot_id: string) => {
    await deleteMutation.mutateAsync(slot_id);
    toast({ title: 'Slot deleted' });
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
      toast({ title: 'Slots imported' });
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
    Day: (value: string) => <span className="font-semibold">{value}</span>,
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

  return (
    <HelmetWrapper
      title="Slots | Seamless"
      heading="Slots Management"
      subHeading="Manage slots for Bodhika."
    >
      <DynamicTable
        tableHeading="Slots"
        data={getTableData(slots).map(row => ({
          ...row,
          Edit: customRender.Edit('', row._row),
          Delete: customRender.Delete('', row._row),
        }))}
        customRender={customRender}
        filterConfig={filterConfig}
        isLoading={isFetching}
        headerActions={
          <div className="flex gap-2">
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Slot
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Slot</DialogTitle>
                </DialogHeader>
                <DynamicForm
                  schema={createSchema}
                  defaultValues={{
                    time: getDefaultTimeRange(),
                  }}
                  onSubmit={handleCreate}
                  onCancel={() => setCreateDialogOpen(false)}
                  submitButtonText="Create"
                />
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
            <Button onClick={() => fileInputRef.current?.click()}>
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
      <Dialog
        open={!!editSlot}
        onOpenChange={open => {
          if (!open) setEditSlot(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Slot</DialogTitle>
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
            submitButtonText="Save"
          />
        </DialogContent>
      </Dialog>
    </HelmetWrapper>
  );
};

export default SlotsManagement;
