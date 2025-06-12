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
import {
  useSlots,
  useCreateSlot,
  useUpdateSlot,
  useDeleteSlot,
} from '@/hooks/bodhika/useSlots.hook';
import { FieldType } from '@/types';

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

const SlotsManagement = () => {
  const { data: slots = [], isLoading } = useSlots();
  const createMutation = useCreateSlot();
  const updateMutation = useUpdateSlot();
  const deleteMutation = useDeleteSlot();

  const [editSlot, setEditSlot] = useState<any | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

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
    day: (value: string) => <span className="font-semibold">{value}</span>,
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

  return (
    <HelmetWrapper
      title="Slots | Seamless"
      heading="Slots Management"
      subHeading="Manage slots for Bodhika."
    >
      <div className="mx-auto p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          <DynamicTable
            tableHeading="Slots"
            data={getTableData(slots).map(row => ({
              ...row,
              Edit: customRender.Edit('', row._row),
              Delete: customRender.Delete('', row._row),
              Day: customRender.day(row.Day),
            }))}
            customRender={customRender}
            headerActions={
              <>
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
                        time: getDefaultTimeRange(), // <-- default value for time slot
                      }}
                      onSubmit={handleCreate}
                      onCancel={() => setCreateDialogOpen(false)}
                      submitButtonText="Create"
                    />
                  </DialogContent>
                </Dialog>
              </>
            }
          />
        )}
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
              defaultValues={editSlot ?? undefined}
              onCancel={() => setEditSlot(null)}
              submitButtonText="Save"
            />
          </DialogContent>
        </Dialog>
      </div>
    </HelmetWrapper>
  );
};

export default SlotsManagement;
