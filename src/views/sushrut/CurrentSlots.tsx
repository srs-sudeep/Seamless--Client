import { useState } from 'react';
import {
  Loader2,
  Eye,
  Clock,
  Calendar,
  Settings,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import {
  DynamicTable,
  Button,
  HelmetWrapper,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Card,
  CardContent,
  DynamicForm,
  toast,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components';
import { Slots, CreateSlotsPayload, type FieldType } from '@/types';
import {
  useSushrutCreateSlots,
  useSushrutSlots,
  useSushrutUpdateSlot,
  useSushrutDeleteSlot,
} from '@/hooks';

const SlotsSchema: FieldType[] = [
  {
    name: 'day',
    label: 'Day',
    type: 'enum',
    required: true,
    columns: 1,
    section: 'Days of week',
    options: [
      { label: 'Monday', value: 'Monday' },
      { label: 'Tuesday', value: 'Tuesday' },
      { label: 'Wednesday', value: 'Wednesday' },
      { label: 'Thursday', value: 'Thursday' },
      { label: 'Friday', value: 'Friday' },
      { label: 'Saturday', value: 'Saturday' },
      { label: 'Sunday', value: 'Sunday' },
    ],
  },
  {
    name: 'start_time',
    label: 'Start Time',
    type: 'time',
    required: true,
    columns: 1,
    section: 'Time Slots',
    placeholder: 'Select start time',
  },
  {
    name: 'end_time',
    label: 'End Time',
    type: 'time',
    required: true,
    columns: 1,
    section: 'Time Slots',
    placeholder: 'Select end time',
  },
];

const CurrentSlots = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewSlot, setViewSlot] = useState<Slots | null>(null);
  const [editSlot, setEditSlot] = useState<Slots | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<Slots | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [infoData, setInfoData] = useState({});

  // Hooks
  const { data: slots = [], isFetching, refetch } = useSushrutSlots();
  const createMutation = useSushrutCreateSlots();
  const updateMutation = useSushrutUpdateSlot();
  const deleteMutation = useSushrutDeleteSlot();

  const handleView = (slot: Slots) => {
    setViewSlot(slot);
  };

  const handleEdit = (slot: Slots) => {
    setEditSlot(slot);
    setEditDialogOpen(true);
  };

  const handleDelete = (slot: Slots) => {
    setSlotToDelete(slot);
    setDeleteDialogOpen(true);
  };

  const handleCreateSubmit = async (slotsData: Record<string, any>) => {
    console.log('Creating slot:', slotsData);

    if (!slotsData.day || !slotsData.start_time || !slotsData.end_time) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all the required fields',
        variant: 'destructive',
      });
      return;
    }

    // Validate time logic
    if (slotsData.start_time >= slotsData.end_time) {
      toast({
        title: 'Validation Error',
        description: 'Start time must be before end time',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createMutation.mutateAsync(slotsData as CreateSlotsPayload);
      toast({
        title: 'Success!',
        description: 'Slot created successfully',
      });
      setIsSubmitted(true);
      setCreateDialogOpen(false);
      refetch();

      setTimeout(() => {
        setInfoData({});
        setIsSubmitted(false);
      }, 2000);
    } catch (error: any) {
      console.error('Create slot error:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to create slot. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateSubmit = async (slotsData: Record<string, any>) => {
    console.log('Update called');
    if (!editSlot?.id) {
      toast({
        title: 'Error',
        description: 'No slot selected for editing',
        variant: 'destructive',
      });
      return;
    }

    console.log('Updating slot:', editSlot.id, slotsData);

    if (!slotsData.day || !slotsData.start_time || !slotsData.end_time) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all the required fields',
        variant: 'destructive',
      });
      return;
    }
    console.log('rejected');
    // Validate time logic
    if (slotsData.start_time >= slotsData.end_time) {
      toast({
        title: 'Validation Error',
        description: 'Start time must be before end time',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Inside try', editSlot);
      await updateMutation.mutateAsync({
        id: editSlot.id,
        payload: slotsData as CreateSlotsPayload,
      });
      console.log('After await');
      toast({
        title: 'Success!',
        description: 'Slot updated successfully',
      });
      setEditDialogOpen(false);
      setEditSlot(null);
      refetch();
    } catch (error: any) {
      console.log('Error aa gaya ooye');
      console.error('Update slot error:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update slot. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!slotToDelete?.id) {
      toast({
        title: 'Error',
        description: 'No slot selected for deletion',
        variant: 'destructive',
      });
      return;
    }

    console.log('Deleting slot:', slotToDelete.id);

    try {
      await deleteMutation.mutateAsync(slotToDelete.id);
      toast({
        title: 'Success!',
        description: 'Slot deleted successfully',
      });
      setDeleteDialogOpen(false);
      setSlotToDelete(null);
      refetch();
    } catch (error: any) {
      console.error('Delete slot error:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to delete slot. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const customRender = {
    Day: (value: string) => {
      return <span className={`px-3 py-1  text-l font-semibold  `}>{value}</span>;
    },
    Actions: (_: any, row: Record<string, any>) => (
      <div className="flex gap-2">
        <Button
          size="icon"
          variant="outline"
          onClick={e => {
            e.stopPropagation();
            handleView(row._row);
          }}
          title="View details"
        >
          <Eye className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={e => {
            e.stopPropagation();
            handleEdit(row._row);
          }}
          title="Edit slot"
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={e => {
            e.stopPropagation();
            handleDelete(row._row);
          }}
          title="Delete slot"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>
    ),
  };

  const getTableData = (slots: Slots[]) =>
    slots.map(slot => {
      // Format time display
      const formatTime = (time: string) => {
        if (!time) return 'N/A';
        try {
          // Handle both HH:MM and HH:MM:SS formats
          const timeOnly = time.split(':').slice(0, 2).join(':');
          return new Date(`1970-01-01T${timeOnly}`).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
        } catch {
          return time;
        }
      };

      const calculateDuration = (startTime: string, endTime: string) => {
        if (!startTime || !endTime) return 'N/A';
        try {
          const start = new Date(`1970-01-01T${startTime}`);
          const end = new Date(`1970-01-01T${endTime}`);
          const diff = (end.getTime() - start.getTime()) / (1000 * 60);
          const hours = Math.floor(diff / 60);
          const minutes = diff % 60;
          return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        } catch {
          return 'N/A';
        }
      };

      return {
        Day: slot.day || 'N/A',
        'Start Time': formatTime(slot.start_time),
        'End Time': formatTime(slot.end_time),
        Duration: calculateDuration(slot.start_time, slot.end_time),
        Actions: '',
        _row: { ...slot },
      };
    });

  // Get default values for edit form
  const getEditDefaultValues = (slot: Slots) => {
    return {
      day: slot.day,
      start_time: slot.start_time,
      end_time: slot.end_time,
    };
  };

  if (isFetching && slots.length === 0) {
    return (
      <HelmetWrapper
        title="Slots | Sushrut"
        heading="Slots"
        subHeading="Weekly schedule slots management system"
      >
        <div className="flex justify-center items-center h-96 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading slots data...</p>
          </div>
        </div>
      </HelmetWrapper>
    );
  }

  return (
    <HelmetWrapper
      title="Slots | Sushrut"
      heading="Slots"
      subHeading="Comprehensive weekly schedule slots for time management"
    >
      <div className="space-y-8">
        {/* Slots Table */}
        <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              Weekly Schedule Slots
            </h2>
            <p className="text-muted-foreground mt-2">
              Manage and view all time slots for the weekly schedule
            </p>
          </div>

          <div className="p-6">
            <DynamicTable
              tableHeading="Schedule Slots"
              data={getTableData(slots)}
              customRender={customRender}
              isLoading={isFetching}
              headerActions={
                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Slot
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gradient-to-br from-background to-muted/20 border-2 border-border max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                          <Plus className="w-6 h-6 text-primary" />
                          Create New Slot
                        </DialogTitle>
                      </DialogHeader>
                      <DynamicForm
                        schema={SlotsSchema}
                        onSubmit={handleCreateSubmit}
                        onCancel={() => setCreateDialogOpen(false)}
                        submitButtonText="Create Slot"
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* Edit Slot Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-gradient-to-br from-background to-muted/20 border-2 border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Edit className="w-6 h-6 text-primary" />
              Edit Slot
            </DialogTitle>
          </DialogHeader>
          {editSlot && (
            <DynamicForm
              schema={SlotsSchema}
              onSubmit={handleUpdateSubmit}
              onCancel={() => {
                setEditDialogOpen(false);
                setEditSlot(null);
              }}
              submitButtonText="Update Slot"
              defaultValues={getEditDefaultValues(editSlot)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-destructive" />
              Delete Slot
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this slot? This action cannot be undone.
              {slotToDelete && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="font-medium">
                    {slotToDelete.day} - {slotToDelete.start_time} to {slotToDelete.end_time}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSlotToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Details Dialog */}
      <Dialog open={!!viewSlot} onOpenChange={() => setViewSlot(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              Slot Details
            </DialogTitle>
          </DialogHeader>

          {viewSlot && (
            <div className="space-y-6">
              {/* Slot Information */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {viewSlot.day} Schedule
                      </h3>
                      <div className="flex items-center gap-2">
                        {customRender.Day(viewSlot.day)}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-muted-foreground mt-1" />
                          <div>
                            <h4 className="font-semibold mb-1">Start Time</h4>
                            <p className="text-muted-foreground">
                              {viewSlot.start_time
                                ? new Date(`1970-01-01T${viewSlot.start_time}`).toLocaleTimeString(
                                    [],
                                    {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    }
                                  )
                                : 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-muted-foreground mt-1" />
                          <div>
                            <h4 className="font-semibold mb-1">End Time</h4>
                            <p className="text-muted-foreground">
                              {viewSlot.end_time
                                ? new Date(`1970-01-01T${viewSlot.end_time}`).toLocaleTimeString(
                                    [],
                                    {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    }
                                  )
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-start gap-3 mb-4">
                        <Calendar className="w-5 h-5 text-muted-foreground mt-1" />
                        <div>
                          <h4 className="font-semibold mb-1">Duration</h4>
                          <p className="text-muted-foreground">
                            {viewSlot.start_time && viewSlot.end_time
                              ? (() => {
                                  try {
                                    const start = new Date(`1970-01-01T${viewSlot.start_time}`);
                                    const end = new Date(`1970-01-01T${viewSlot.end_time}`);
                                    const diff = (end.getTime() - start.getTime()) / (1000 * 60);
                                    const hours = Math.floor(diff / 60);
                                    const minutes = diff % 60;
                                    return hours > 0
                                      ? `${hours}h ${minutes}m`
                                      : `${minutes} minutes`;
                                  } catch {
                                    return 'N/A';
                                  }
                                })()
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {viewSlot.created_at && (
                      <div className="border-t pt-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Created:</span>
                            <p className="font-medium">
                              {new Date(viewSlot.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {viewSlot.updated_at && (
                            <div>
                              <span className="text-muted-foreground">Last Updated:</span>
                              <p className="font-medium">
                                {new Date(viewSlot.updated_at).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card className="border border-info/20 bg-info/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-info/10 rounded-lg flex items-center justify-center mt-1">
                      <Settings className="w-4 h-4 text-info" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-info mb-2">Schedule Information</h4>
                      <p className="text-sm text-info/80">
                        This slot is part of the weekly schedule management system. You can modify
                        the time slots and configure the weekly schedule according to your
                        requirements.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </HelmetWrapper>
  );
};

export default CurrentSlots;
