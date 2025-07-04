import { useState, useMemo } from 'react';
import { Loader2, BarChart3, Clock, User } from 'lucide-react';
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
import { useDoctorSlots, useAppointmentsByDoctor } from '@/hooks/sushrut/useAppointment.hook';
import type { Doctor } from '@/types/sushrut/doctor.types';
import { type FieldType } from '@/types';

const DoctorsManagement = () => {
  const { data: doctors = [], isFetching } = useDoctors();
  const { data: slots = [], isFetching: slotsLoading } = useSlots();
  const assignSlotsMutation = useAssignDoctorSlots();

  const [slotDoctor, setSlotDoctor] = useState<Doctor | null>(null);
  const [slotFormData, setSlotFormData] = useState<Record<string, any>>({});
  const [expandedDoctorLdap, setExpandedDoctorLdap] = useState<string>('');

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
    Name: (value: string) => {
      return (
        <span className="font-medium text-foreground flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          {value}
        </span>
      );
    },
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
    Department: (value: string) => {
      return (
        <span className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs font-medium">
          {value}
        </span>
      );
    },
  };

  const getTableData = (doctors: Doctor[]) =>
    doctors.map(doctor => {
      return {
        Name: doctor.name || 'N/A',
        'Ldap Id': doctor.ldapid || 'N/A',
        Email: doctor.email || 'N/A',
        Department: doctor.department || 'N/A',
        Status: doctor.is_active,
        'Add Slot': '',
        _row: { ...doctor },
        _expandable: true,
      };
    });

  // Expandable component for doctor details
  const renderExpandedComponent = (row: Record<string, any>) => {
    const doctor = row._row as Doctor;

    // Set the expanded doctor LDAP when component renders
    if (expandedDoctorLdap !== doctor.ldapid) {
      setExpandedDoctorLdap(doctor.ldapid);
    }

    return <DoctorExpandedDetails doctor={doctor} />;
  };

  // Separate component for expanded details to handle API calls
  const DoctorExpandedDetails = ({ doctor }: { doctor: Doctor }) => {
    // Fetch doctor's assigned slots
    const { data: doctorSlots, isFetching: slotsLoading } = useDoctorSlots(doctor.ldapid);

    // Fetch existing appointments for this doctor
    const { data: existingAppointments = [], isFetching: appointmentsLoading } =
      useAppointmentsByDoctor(doctor.ldapid);

    // Merge slots with booking status (similar to appointment booking page)
    const slotsWithBookingStatus = useMemo(() => {
      if (!doctorSlots?.slots) return [];

      const bookedSlotIds = new Set(existingAppointments.map(appointment => appointment.slot_id));

      return doctorSlots.slots.map(slot => ({
        ...slot,
        is_booked: bookedSlotIds.has(slot.id),
      }));
    }, [doctorSlots, existingAppointments]);

    // Group slots by day with booking status (similar to appointment booking page)
    const slotsByDay = useMemo(() => {
      if (!slotsWithBookingStatus.length) return {};

      const grouped = slotsWithBookingStatus.reduce(
        (acc, slot) => {
          if (!acc[slot.day]) {
            acc[slot.day] = [];
          }
          acc[slot.day].push(slot);
          return acc;
        },
        {} as Record<string, any[]>
      );

      // Sort days of week
      const dayOrder = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ];
      const sortedGrouped: Record<string, any[]> = {};

      dayOrder.forEach(day => {
        if (grouped[day]) {
          // Sort slots by start time
          sortedGrouped[day] = grouped[day].sort((a, b) =>
            a.start_time.localeCompare(b.start_time)
          );
        }
      });

      return sortedGrouped;
    }, [slotsWithBookingStatus]);

    // Check if data is loading
    const isDataLoading = slotsLoading || appointmentsLoading;

    return (
      <div className="bg-muted/30 rounded-lg p-6 space-y-6">
        {/* Assigned Slots Section (Similar to Appointment Booking) */}
        <div className="space-y-4">
          {isDataLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Loading assigned slots and checking bookings...
                </p>
              </div>
            </div>
          ) : Object.keys(slotsByDay).length === 0 ? (
            <div className="text-center py-8 bg-muted/20 rounded-lg border-2 border-dashed border-border">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h6 className="font-semibold text-foreground mb-2">No Assigned Slots</h6>
              <p className="text-sm text-muted-foreground">
                This doctor has no time slots assigned yet
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(slotsByDay).map(([day, slots]) => (
                <div key={day}>
                  <div className="overflow-x-auto pb-2">
                    <div className="flex gap-4 min-w-max">
                      {slots.map((slot: any) => (
                        <div
                          key={slot.id}
                          className={`border-2 rounded-lg p-4 min-w-[280px] flex-shrink-0 space-y-3 ${
                            slot.is_booked
                              ? 'bg-destructive/10 border-destructive/20'
                              : 'bg-card border-border'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <h6 className="font-semibold text-foreground flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {slot.start_time} - {slot.end_time}
                            </h6>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                slot.is_booked
                                  ? 'bg-destructive/20 text-destructive border border-destructive/30'
                                  : 'bg-success/20 text-success border border-success/30'
                              }`}
                            >
                              {slot.is_booked ? 'Booked' : 'Available'}
                            </span>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Day:</span>
                              <span className="font-medium capitalize">{slot.day}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Duration:</span>
                              <span className="font-medium">
                                {(() => {
                                  try {
                                    const start = new Date(`1970-01-01T${slot.start_time}`);
                                    const end = new Date(`1970-01-01T${slot.end_time}`);
                                    const diff = (end.getTime() - start.getTime()) / (1000 * 60);
                                    const hours = Math.floor(diff / 60);
                                    const minutes = diff % 60;
                                    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                                  } catch {
                                    return 'N/A';
                                  }
                                })()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Slot ID:</span>
                              <span className="font-mono font-medium text-xs">{slot.id}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

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
      placeholder: 'Select time slots to assign',
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
              Manage doctors, their access levels, and schedule assignments. Click the expand arrow
              to view detailed information.
            </p>
          </div>

          <div className="p-6">
            <DynamicTable
              tableHeading="Doctors"
              data={getTableData(doctors)}
              customRender={customRender}
              isLoading={isFetching}
              expandableRows={true}
              expandedComponent={renderExpandedComponent}
              rowExpandable={row => row._expandable === true}
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
