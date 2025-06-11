import { useState, useRef } from 'react';
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
import {
  useRooms,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
} from '@/hooks/bodhika/useRooms.hook';
import { FieldType } from '@/types';

const createSchema: FieldType[] = [
  { name: 'room_id', label: 'Room ID', type: 'text', required: true, columns: 2 },
  { name: 'room_name', label: 'Room Name', type: 'text', required: true, columns: 2 },
];

const editSchema: FieldType[] = [
  { name: 'room_name', label: 'Room Name', type: 'text', required: true, columns: 2 },
];

const RoomsManagement = () => {
  const { data: rooms = [], isLoading } = useRooms();
  const createMutation = useCreateRoom();
  const updateMutation = useUpdateRoom();
  const deleteMutation = useDeleteRoom();

  const [editRoom, setEditRoom] = useState<any | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CSV Template headers
  const csvTemplate = 'room_id,room_name\n';

  // Download CSV template
  const handleDownloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rooms_template.csv';
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
      const importedRooms = rows.map(row => {
        const values = row.split(',').map(v => v.trim());
        const room: any = {};
        headers.forEach((h, i) => {
          room[h] = values[i];
        });
        return room;
      });
      // Bulk create rooms (in parallel, and wait for all)
      await Promise.all(
        importedRooms
          .filter(room => room.room_id && room.room_name)
          .map(
            room =>
              createMutation.mutateAsync({
                room_id: room.room_id,
                room_name: room.room_name,
              }),
            console.log(importedRooms)
          )
      );
      toast({ title: 'Rooms imported' });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleEdit = (room: any) => setEditRoom(room);

  const handleUpdate = async (formData: Record<string, any>) => {
    if (!editRoom) return;
    await updateMutation.mutateAsync({
      room_id: editRoom.room_id,
      payload: {
        room_name: formData.room_name,
      },
    });
    toast({ title: 'Room updated' });
    setEditRoom(null);
  };

  const handleCreate = async (formData: Record<string, any>) => {
    await createMutation.mutateAsync({
      room_id: formData.room_id,
      room_name: formData.room_name,
    });
    toast({ title: 'Room created' });
    setCreateDialogOpen(false);
  };

  const handleDelete = async (room_id: string) => {
    await deleteMutation.mutateAsync(room_id);
    toast({ title: 'Room deleted' });
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
          handleDelete(row._row.room_id);
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
    is_deleted: (value: boolean) => (
      <button
        type="button"
        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
          value ? 'bg-red-500' : 'bg-gray-300'
        }`}
        disabled
        aria-pressed={!!value}
      >
        <span
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
            value ? 'translate-x-6' : ''
          }`}
        />
      </button>
    ),
  };

  const getTableData = (rooms: any[]) =>
    rooms.map(room => ({
      'Room ID': room.room_id,
      'Room Name': room.room_name,
      'Is Deleted': customRender.is_deleted(room.is_deleted),
      Edit: '',
      Delete: '',
      _row: { ...room },
    }));

  return (
    <HelmetWrapper
      title="Rooms | Seamless"
      heading="Rooms List"
      subHeading="List of rooms for Bodhika."
    >
      <div className="mx-auto p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          <DynamicTable
            tableHeading="Rooms"
            data={getTableData(rooms)}
            customRender={customRender}
            headerActions={
              <div className="flex gap-2">
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Room
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Room</DialogTitle>
                    </DialogHeader>
                    <DynamicForm
                      schema={createSchema}
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
        )}
        <Dialog
          open={!!editRoom}
          onOpenChange={open => {
            if (!open) setEditRoom(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Room</DialogTitle>
            </DialogHeader>
            <DynamicForm
              schema={editSchema}
              onSubmit={handleUpdate}
              defaultValues={editRoom ?? undefined}
              onCancel={() => setEditRoom(null)}
              submitButtonText="Save"
            />
          </DialogContent>
        </Dialog>
      </div>
    </HelmetWrapper>
  );
};

export default RoomsManagement;
