import { useState } from 'react';
import { Loader2, BarChart3, Clock } from 'lucide-react';
import {
  DynamicTable,
  Button,
  HelmetWrapper,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Card,
  CardContent,
  DynamicForm,
  toast,
} from '@/components';
import { useDoctors, useSlots, useAssignDoctorSlots } from '@/hooks/sushrut/useDoctor.hook';
import type { Doctor } from '@/types/sushrut/doctor.types';
import { type FieldType } from '@/types';

const DoctorsManagement = () => {
  const { data: doctors = [], isFetching } = useDoctors();
  const { data: slots = [], isFetching: slotsLoading } = useSlots();
  const assignSlotsMutation = useAssignDoctorSlots();

  const [slotDoctor, setSlotDoctor] = useState<Doctor | null>(null);
  const [slotFormData, setSlotFormData] = useState<Record<string, any>>({});

  const handleAddSlot = (doctor: Doctor) => {
    setSlotDoctor(doctor);
    setSlotFormData({});
  };

  const handleSlotSubmit = async (formData: Record<string, any>) => {
    const selectedSlots = formData.slot_ids || [];

    if (!slotDoctor || selectedSlots.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one slot',
        variant: 'destructive',
      });
      return;
    }

    try {
      await assignSlotsMutation.mutateAsync({
        ldapid: slotDoctor.ldapid,
        slot_ids: selectedSlots.map((id: string) => Number(id)),
      });

      toast({
        title: 'Success!',
        description: 'Slots assigned successfully',
      });

      setSlotDoctor(null);
      setSlotFormData({});
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign slots. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const customRender = {
    'Add Slot': (_: any, row: Record<string, any>) => (
      <Button
        size="sm"
        variant="outline"
        onClick={e => {
          e.stopPropagation();
          handleAddSlot(row._row);
        }}
        className="flex items-center gap-1"
      >
        <Clock className="w-3 h-3" />
        Add Slot
      </Button>
    ),
    Status: (value: boolean) => (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          value
            ? 'bg-success/10 border-success text-success'
            : 'bg-destructive/10 border-destructive text-destructive'
        }`}
      >
        {value ? 'Active' : 'Inactive'}
      </span>
    ),
  };

  const getTableData = (doctors: Doctor[]) =>
    doctors.map(doctor => ({
      'Ldap Id': doctor.ldapid || 'N/A',
      Email: doctor.email || 'N/A',
      Department: doctor.department || 'N/A',
      Status: doctor.is_active,
      'Add Slot': '',
      _row: { ...doctor },
    }));

  // Format slots for multiselect options
  const slotOptions = slots.map(slot => ({
    value: String(slot.id),
    label: `${slot.day.charAt(0).toUpperCase() + slot.day.slice(1)} (${slot.start_time} - ${slot.end_time})`,
  }));

  // Dynamic form schema for slot assignment
  const slotAssignmentSchema: FieldType[] = [
    {
      name: 'slot_ids',
      label: 'Available Time Slots',
      type: 'multiselect',
      required: true,
      columns: 2,
      options: slotOptions,
      placeholder: 'eg. 09:00 - 17:00',
      section: 'Slot Assignment',
    },
  ];

  if (isFetching && doctors.length === 0) {
    return (
      <HelmetWrapper
        title="Doctors Management | Sushrut"
        heading="Doctors Management"
        subHeading="Manage doctors and their system access"
      >
        <div className="flex justify-center items-center h-96 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading doctors data...</p>
          </div>
        </div>
      </HelmetWrapper>
    );
  }

  return (
    <HelmetWrapper
      title="Doctors Management | Sushrut"
      heading="Doctors Management"
      subHeading="Comprehensive doctor management with role-based access and slot assignment"
    >
      <div className="space-y-8">
        {/* Doctors Table */}
        <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              Doctor Management System
            </h2>
            <p className="text-muted-foreground mt-2">
              Manage doctors, their access levels, and schedule assignments
            </p>
          </div>

          <div className="p-6">
            <DynamicTable
              tableHeading="Doctors"
              data={getTableData(doctors)}
              customRender={customRender}
              isLoading={isFetching}
            />
          </div>
        </div>
      </div>

      {/* Add Slot Dialog */}
      <Dialog open={!!slotDoctor} onOpenChange={() => setSlotDoctor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Assign Slots to {slotDoctor?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Doctor Information</h4>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm">
                      <p>
                        <strong>Name:</strong> {slotDoctor?.name}
                      </p>
                      <p>
                        <strong>Department:</strong> {slotDoctor?.department}
                      </p>
                      <p>
                        <strong>LDAP ID:</strong> {slotDoctor?.ldapid}
                      </p>
                    </div>
                  </div>

                  <div>
                    {slotsLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Loading available slots...</span>
                      </div>
                    ) : (
                      <DynamicForm
                        schema={slotAssignmentSchema}
                        onSubmit={handleSlotSubmit}
                        defaultValues={slotFormData}
                        onChange={setSlotFormData}
                        submitButtonText={
                          assignSlotsMutation.isPending ? 'Assigning...' : 'Assign Slots'
                        }
                        onCancel={() => setSlotDoctor(null)}
                      />
                    )}
                  </div>

                  {slotFormData.slot_ids && slotFormData.slot_ids.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">
                        Selected Slots ({slotFormData.slot_ids.length})
                      </h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {slotFormData.slot_ids.map((slotId: string) => {
                          const slot = slots.find(s => String(s.id) === slotId);
                          return slot ? (
                            <div
                              key={slotId}
                              className="bg-primary/5 text-primary px-3 py-1 rounded text-sm"
                            >
                              {slot.day.charAt(0).toUpperCase() + slot.day.slice(1)} (
                              {slot.start_time} - {slot.end_time})
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </HelmetWrapper>
  );
};

export default DoctorsManagement;
