import { useState, useRef } from 'react';
import {
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Download,
  Upload,
  MapPin,
  Building2,
  Target,
  BarChart3,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Database,
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
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from '@/hooks';
import { FieldType } from '@/types';

const createSchema: FieldType[] = [
  { name: 'room_id', label: 'Room ID', type: 'text', required: true, columns: 2 },
  { name: 'room_name', label: 'Room Name', type: 'text', required: true, columns: 2 },
];

const editSchema: FieldType[] = [
  { name: 'room_name', label: 'Room Name', type: 'text', required: true, columns: 2 },
];

const RoomsManagement = () => {
  const { data: rooms = [], isFetching } = useRooms();
  const createMutation = useCreateRoom();
  const updateMutation = useUpdateRoom();
  const deleteMutation = useDeleteRoom();

  const [editRoom, setEditRoom] = useState<any | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate statistics
  const totalRooms = rooms.length;
  const activeRooms = rooms.filter(room => !room.is_deleted).length;
  const deletedRooms = rooms.filter(room => room.is_deleted).length;

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
          .map(room =>
            createMutation.mutateAsync({
              room_id: room.room_id,
              room_name: room.room_name,
            })
          )
      );
      toast({ title: 'Rooms imported successfully' });
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
    toast({ title: 'Room updated successfully' });
    setEditRoom(null);
  };

  const handleCreate = async (formData: Record<string, any>) => {
    await createMutation.mutateAsync({
      room_id: formData.room_id,
      room_name: formData.room_name,
    });
    toast({ title: 'Room created successfully' });
    setCreateDialogOpen(false);
  };

  const handleDelete = async (room_id: string) => {
    await deleteMutation.mutateAsync(room_id);
    toast({ title: 'Room deleted successfully' });
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
    'Is Deleted': (value: boolean) => (
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${value ? 'bg-destructive' : 'bg-success'}`}></div>
        <span className={`text-sm font-medium ${value ? 'text-destructive' : 'text-success'}`}>
          {value ? 'Deleted' : 'Active'}
        </span>
      </div>
    ),
  };

  const getTableData = (rooms: any[]) =>
    rooms.map(room => ({
      'Room ID': room.room_id,
      'Room Name': room.room_name,
      'Is Deleted': room.is_deleted,
      Edit: '',
      Delete: '',
      _row: { ...room },
    }));

  if (isFetching && rooms.length === 0) {
    return (
      <HelmetWrapper
        title="Rooms | Seamless"
        heading="Room Management"
        subHeading="Comprehensive facility management system for academic spaces"
      >
        <div className="flex justify-center items-center h-96 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading room data...</p>
          </div>
        </div>
      </HelmetWrapper>
    );
  }

  return (
    <HelmetWrapper
      title="Rooms | Seamless"
      heading="Room Management"
      subHeading="Comprehensive facility management system for academic spaces and classroom administration"
    >
      <div className="space-y-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card-blue-gradient rounded-2xl p-6 border-2 border-card-blue">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-blue-icon rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-blue font-medium mb-1">Total Rooms</p>
                <p className="text-2xl font-bold text-card-blue">{totalRooms}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-green-gradient rounded-2xl p-6 border-2 border-card-green">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-green-icon rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-green font-medium mb-1">Active Rooms</p>
                <p className="text-2xl font-bold text-card-green">{activeRooms}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-red-gradient rounded-2xl p-6 border-2 border-card-red">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-red-icon rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-red font-medium mb-1">Deleted Rooms</p>
                <p className="text-2xl font-bold text-card-red">{deletedRooms}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Room Table Container */}
        <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              Room Directory
            </h2>
            <p className="text-muted-foreground mt-2">
              Comprehensive management of all academic spaces and facilities with bulk import
              capabilities
            </p>
          </div>

          <div className="p-6">
            <DynamicTable
              tableHeading="Rooms"
              data={getTableData(rooms)}
              customRender={customRender}
              isLoading={isFetching || createMutation.isPending || updateMutation.isPending}
              headerActions={
                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Room
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gradient-to-br from-background to-muted/20 border-2 border-border">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                          <Plus className="w-6 h-6 text-primary" />
                          Create New Room
                        </DialogTitle>
                      </DialogHeader>
                      <DynamicForm
                        schema={createSchema}
                        onSubmit={handleCreate}
                        onCancel={() => setCreateDialogOpen(false)}
                        submitButtonText="Create Room"
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

        {/* Management Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Quick Actions</h3>
                <p className="text-sm text-muted-foreground">Manage rooms efficiently</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <Plus className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Add new rooms individually or in bulk</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <Pencil className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Edit room details with inline actions</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Bulk Operations</h3>
                <p className="text-sm text-muted-foreground">Import/export room data</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <Download className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Download CSV template for bulk import</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <Upload className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Import multiple rooms from CSV file</span>
              </div>
            </div>
          </div>
        </div>

        {/* Room Status Information */}
        <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-info rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Room Status Guide</h3>
              <p className="text-sm text-muted-foreground">Understanding room status indicators</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
                <div className="w-4 h-4 rounded-full bg-success"></div>
                <div>
                  <span className="font-medium text-foreground">Active Rooms</span>
                  <p className="text-sm text-muted-foreground">Available for scheduling and use</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
                <div className="w-4 h-4 rounded-full bg-destructive"></div>
                <div>
                  <span className="font-medium text-foreground">Deleted Rooms</span>
                  <p className="text-sm text-muted-foreground">
                    Removed from active use but retained in records
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
                <MapPin className="w-4 h-4 text-primary" />
                <div>
                  <span className="font-medium text-foreground">Room Management</span>
                  <p className="text-sm text-muted-foreground">
                    Edit names and manage room information
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
                <FileSpreadsheet className="w-4 h-4 text-primary" />
                <div>
                  <span className="font-medium text-foreground">Bulk Import</span>
                  <p className="text-sm text-muted-foreground">
                    Use CSV files for efficient bulk room creation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Edit Dialog */}
      <Dialog
        open={!!editRoom}
        onOpenChange={open => {
          if (!open) setEditRoom(null);
        }}
      >
        <DialogContent className="bg-gradient-to-br from-background to-muted/20 border-2 border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Pencil className="w-6 h-6 text-primary" />
              Edit Room Details
            </DialogTitle>
          </DialogHeader>
          <DynamicForm
            schema={editSchema}
            onSubmit={handleUpdate}
            defaultValues={editRoom ?? undefined}
            onCancel={() => setEditRoom(null)}
            submitButtonText="Save Changes"
          />
        </DialogContent>
      </Dialog>
    </HelmetWrapper>
  );
};

export default RoomsManagement;
