import { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  CheckCircle,
  AlertCircle,
  Loader2,
  CalendarDays,
  UserCheck,
  Heart,
} from 'lucide-react';
import {
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
import { useDoctors } from '@/hooks/sushrut/useDoctor.hook';
import {
  useDoctorSlots,
  useAppointmentsByDoctor,
  useCreateAppointment,
} from '@/hooks/sushrut/useAppointment.hook';
import type { AppointmentSlot } from '@/types/sushrut/appointment.types';
import { type FieldType } from '@/types';

const AppointmentBooking = () => {
  const { data: doctors = [], isFetching: doctorsLoading } = useDoctors();
  const createAppointmentMutation = useCreateAppointment();

  const [selectedDoctorLdap, setSelectedDoctorLdap] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);
  const [appointmentData, setAppointmentData] = useState<Record<string, any>>({});
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);

  const { data: doctorSlots, isFetching: slotsLoading } = useDoctorSlots(selectedDoctorLdap);
  const { data: existingAppointments = [], isFetching: appointmentsLoading } =
    useAppointmentsByDoctor(selectedDoctorLdap);

  // Get selected doctor details
  const selectedDoctor = useMemo(() => {
    return doctors.find(doctor => doctor.ldapid === selectedDoctorLdap);
  }, [doctors, selectedDoctorLdap]);

  // Merge slots with booking status
  const slotsWithBookingStatus = useMemo(() => {
    if (!doctorSlots?.slots) return [];

    const bookedSlotIds = new Set(existingAppointments.map(appointment => appointment.slot_id));

    return doctorSlots.slots.map(slot => ({
      ...slot,
      is_booked: bookedSlotIds.has(slot.id),
    }));
  }, [doctorSlots, existingAppointments]);

  // Doctor selection schema
  const doctorSelectionSchema: FieldType[] = [
    {
      name: 'doctor_ldap',
      label: 'Select Doctor',
      type: 'select',
      required: true,
      columns: 2,
      options: doctors.map(doctor => ({
        value: doctor.ldapid,
        label: `${doctor?.name} (${doctor.department})`,
      })),
      placeholder: 'Choose a doctor',
      section: 'Doctor Selection',
    },
  ];

  // Appointment details schema
  const appointmentDetailsSchema: FieldType[] = [
    {
      name: 'patient_type',
      label: 'Patient Type',
      type: 'select',
      required: true,
      columns: 1,
      options: [
        { value: 'new', label: 'New Patient' },
        { value: 'returning', label: 'Returning Patient' },
        { value: 'follow_up', label: 'Follow-up' },
        { value: 'emergency', label: 'Emergency' },
      ],
      section: 'Patient Information',
    },
    {
      name: 'patient_relationship',
      label: 'Patient Relationship',
      type: 'select',
      required: true,
      columns: 1,
      options: [
        { value: 'self', label: 'Self' },
        { value: 'spouse', label: 'Spouse' },
        { value: 'child', label: 'Child' },
        { value: 'parent', label: 'Parent' },
        { value: 'sibling', label: 'Sibling' },
        { value: 'relative', label: 'Other Relative' },
        { value: 'friend', label: 'Friend' },
      ],
      section: 'Patient Information',
    },
  ];

  // Handle doctor selection
  const handleDoctorSelection = (data: Record<string, any>) => {
    setSelectedDoctorLdap(data.doctor_ldap || '');
    setSelectedSlot(null);
    setAppointmentData({});
  };

  // Handle slot selection
  const handleSlotClick = (slot: AppointmentSlot) => {
    if (slot.is_booked) return;
    setSelectedSlot(slot);
    setAppointmentData({});
  };

  // Handle appointment booking
  const handleBookAppointment = async () => {
    if (!selectedSlot || !selectedDoctorLdap) {
      toast({
        title: 'Error',
        description: 'Please select a doctor and time slot',
        variant: 'destructive',
      });
      return;
    }

    const requiredFields = ['patient_type', 'patient_relationship'];
    const missingFields = requiredFields.filter(field => !appointmentData[field]);

    if (missingFields.length > 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createAppointmentMutation.mutateAsync({
        doctor_ldap: selectedDoctorLdap,
        patient_type: appointmentData.patient_type,
        slot_id: selectedSlot.id,
        patient_relationship: appointmentData.patient_relationship,
      });

      toast({
        title: 'Success!',
        description: 'Appointment booked successfully',
      });

      setIsBookingConfirmed(true);

      // Reset after 3 seconds
      setTimeout(() => {
        setSelectedSlot(null);
        setAppointmentData({});
        setIsBookingConfirmed(false);
      }, 3000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to book appointment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Group slots by day with booking status
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
      {} as Record<string, AppointmentSlot[]>
    );

    // Sort days of week
    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const sortedGrouped: Record<string, AppointmentSlot[]> = {};

    dayOrder.forEach(day => {
      if (grouped[day]) {
        // Sort slots by start time
        sortedGrouped[day] = grouped[day].sort((a, b) => a.start_time.localeCompare(b.start_time));
      }
    });

    return sortedGrouped;
  }, [slotsWithBookingStatus]);

  // Calculate statistics
  const slotStats = useMemo(() => {
    if (!slotsWithBookingStatus.length) return { total: 0, available: 0, booked: 0 };

    const total = slotsWithBookingStatus.length;
    const booked = slotsWithBookingStatus.filter(slot => slot.is_booked).length;
    const available = total - booked;

    return { total, available, booked };
  }, [slotsWithBookingStatus]);

  // Check if data is loading
  const isDataLoading = slotsLoading || appointmentsLoading;

  return (
    <HelmetWrapper
      title="Book Appointment | Sushrut"
      heading="Book Appointment"
      subHeading="Schedule your appointment with our medical professionals"
    >
      <div className="space-y-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card-blue-gradient rounded-2xl p-6 border-2 border-card-blue">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-card-blue-icon rounded-xl flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-card-blue font-medium">Selected Doctor</p>
                <p className="text-lg font-bold text-card-blue">
                  {selectedDoctor ? `${selectedDoctor?.name}` : 'Not Selected'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card-green-gradient rounded-2xl p-6 border-2 border-card-green">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-card-green-icon rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-card-green font-medium">Available Slots</p>
                <p className="text-lg font-bold text-card-green">{slotStats.available}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-orange-gradient rounded-2xl p-6 border-2 border-card-orange">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-card-orange-icon rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-card-orange font-medium">Booked Slots</p>
                <p className="text-lg font-bold text-card-orange">{slotStats.booked}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-purple-gradient rounded-2xl p-6 border-2 border-card-purple">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-card-purple-icon rounded-xl flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-card-purple font-medium">Total Slots</p>
                <p className="text-lg font-bold text-card-purple">{slotStats.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Selection */}
        <Card className="border-2 border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Select Doctor</h3>
            </div>

            {doctorsLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading doctors...</span>
              </div>
            ) : (
              <DynamicForm
                schema={doctorSelectionSchema}
                onSubmit={handleDoctorSelection}
                defaultValues={{ doctor_ldap: selectedDoctorLdap }}
                onChange={handleDoctorSelection}
                isSubmitButtonVisible={false}
              />
            )}

            {selectedDoctor && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Selected Doctor Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">Dr. {selectedDoctor?.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department:</span>
                    <p className="font-medium">{selectedDoctor.department}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{selectedDoctor.email}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Slot Calendar */}
        {selectedDoctorLdap && (
          <Card className="border-2 border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-secondary-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Available Time Slots</h3>
                {isDataLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Checking availability...</span>
                  </div>
                )}
              </div>

              {isDataLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      Loading available slots and checking bookings...
                    </p>
                  </div>
                </div>
              ) : Object.keys(slotsByDay).length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No slots available for this doctor</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(slotsByDay).map(([day, slots]) => (
                    <div key={day}>
                      <h4 className="text-lg font-semibold mb-3 capitalize flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        {day}
                        <span className="text-sm font-normal text-muted-foreground">
                          ({slots.filter(s => !s.is_booked).length} available,{' '}
                          {slots.filter(s => s.is_booked).length} booked)
                        </span>
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                        {slots.map(slot => (
                          <button
                            key={slot.id}
                            onClick={() => handleSlotClick(slot)}
                            disabled={slot.is_booked}
                            className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                              slot.is_booked
                                ? 'bg-destructive/10 border-destructive/20 text-destructive cursor-not-allowed opacity-60'
                                : selectedSlot?.id === slot.id
                                  ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                                  : 'bg-card hover:bg-muted border-border hover:border-primary/50 text-foreground hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Clock className="w-3 h-3" />
                            </div>
                            <div className="text-xs">
                              {slot.start_time} - {slot.end_time}
                            </div>
                            {slot.is_booked && (
                              <div className="text-xs mt-1 text-destructive font-semibold">
                                Booked
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Legend */}
              <div className="mt-6 pt-4 border-t border-border">
                <h5 className="font-semibold mb-2">Legend:</h5>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-card border-2 border-border rounded"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-primary rounded"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-destructive/10 border-2 border-destructive/20 rounded opacity-60"></div>
                    <span>Booked</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Appointment Booking Dialog */}
      <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              Book Appointment
            </DialogTitle>
          </DialogHeader>

          {!isBookingConfirmed ? (
            <div className="space-y-6">
              {/* Appointment Summary */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">Appointment Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Doctor:</span>
                      <p className="font-medium">{selectedDoctor?.name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Department:</span>
                      <p className="font-medium">{selectedDoctor?.department}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Day:</span>
                      <p className="font-medium capitalize">{selectedSlot?.day}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time:</span>
                      <p className="font-medium">
                        {selectedSlot?.start_time} - {selectedSlot?.end_time}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Patient Details Form */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Patient Details
                  </h4>
                  <DynamicForm
                    schema={appointmentDetailsSchema}
                    onSubmit={setAppointmentData}
                    defaultValues={appointmentData}
                    onChange={setAppointmentData}
                    submitButtonText="Update Details"
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedSlot(null)}
                  disabled={createAppointmentMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBookAppointment}
                  disabled={
                    createAppointmentMutation.isPending ||
                    !appointmentData.patient_type ||
                    !appointmentData.patient_relationship
                  }
                  className="flex items-center gap-2"
                >
                  {createAppointmentMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {createAppointmentMutation.isPending ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </div>
            </div>
          ) : (
            /* Success State */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Appointment Booked Successfully!
              </h3>
              <p className="text-muted-foreground mb-6">
                Your appointment with Dr. {selectedDoctor?.name} has been confirmed.
              </p>

              <div className="bg-muted/50 rounded-lg p-4 max-w-md mx-auto">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date & Time:</span>
                    <span className="font-medium">
                      {selectedSlot?.day} ({selectedSlot?.start_time} - {selectedSlot?.end_time})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Patient Type:</span>
                    <span className="font-medium capitalize">{appointmentData.patient_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Relationship:</span>
                    <span className="font-medium capitalize">
                      {appointmentData.patient_relationship}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </HelmetWrapper>
  );
};

export default AppointmentBooking;
