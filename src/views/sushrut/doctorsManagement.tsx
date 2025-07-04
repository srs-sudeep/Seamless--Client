import { useState, useMemo } from 'react';
import {
  Loader2,
  Eye,
  User,
  Building,
  Mail,
  Shield,
  BarChart3,
  CheckCircle,
  UserPlus,
  Clock,
  Calendar,
  Plus,
} from 'lucide-react';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  DynamicForm,
  toast,
} from '@/components';
import { useDoctors, useSlots, useAssignDoctorSlots } from '@/hooks/sushrut/useDoctor.hook';
import type { Doctor, Slot } from '@/types/sushrut/doctor.types';
import { type FieldType } from '@/types';

const DoctorsManagement = () => {
  const { data: doctors = [], isFetching } = useDoctors();
  const { data: slots = [], isFetching: slotsLoading } = useSlots();
  const assignSlotsMutation = useAssignDoctorSlots();

  const [viewDoctor, setViewDoctor] = useState<Doctor | null>(null);
  const [slotDoctor, setSlotDoctor] = useState<Doctor | null>(null);
  const [slotFormData, setSlotFormData] = useState<Record<string, any>>({});

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalDoctors = doctors.length;
    const activeDoctors = doctors.filter(d => d.is_active).length;
    const inactiveDoctors = totalDoctors - activeDoctors;

    const departments = new Set(doctors.map(d => d.department)).size;

    const activeGuestUsers = doctors.filter(d => d.guest_user?.is_active).length;

    // Count roles
    const allRoles = doctors.flatMap(d => d.guest_user?.roles || []);
    const uniqueRoles = new Set(allRoles).size;

    return {
      totalDoctors,
      activeDoctors,
      inactiveDoctors,
      departments,
      activeGuestUsers,
      uniqueRoles,
    };
  }, [doctors]);

  const handleView = (doctor: Doctor) => {
    setViewDoctor(doctor);
  };

  const handleAddSlot = (doctor: Doctor) => {
    setSlotDoctor(doctor);
    setSlotFormData({});
  };

  const handleSlotSubmit = async () => {
    const selectedSlots = slotFormData.slot_ids || [];

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
    View: (_: any, row: Record<string, any>) => (
      <Button
        size="icon"
        variant="outline"
        onClick={e => {
          e.stopPropagation();
          handleView(row._row);
        }}
      >
        <Eye className="w-4 h-4" />
      </Button>
    ),
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
    'Guest Status': (value: boolean) => (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${
          value ? 'bg-info/10 text-info' : 'bg-muted/50 text-muted-foreground'
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
      View: '',
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
      columns: 1,
      options: slotOptions,
      placeholder: 'Select time slots for the doctor',
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
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card-blue-gradient rounded-2xl p-6 border-2 border-card-blue">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-blue-icon rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-blue font-medium mb-1">Total Doctors</p>
                <p className="text-2xl font-bold text-card-blue">{statistics.totalDoctors}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-green-gradient rounded-2xl p-6 border-2 border-card-green">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-green-icon rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-green font-medium mb-1">Active Doctors</p>
                <p className="text-2xl font-bold text-card-green">{statistics.activeDoctors}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-purple-gradient rounded-2xl p-6 border-2 border-card-purple">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-purple-icon rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-purple font-medium mb-1">Departments</p>
                <p className="text-2xl font-bold text-card-purple">{statistics.departments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card-orange-gradient rounded-2xl p-6 border-2 border-card-orange">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-orange-icon rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-orange font-medium mb-1">Active Guest Users</p>
                <p className="text-2xl font-bold text-card-orange">{statistics.activeGuestUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-teal-gradient rounded-2xl p-6 border-2 border-card-teal">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-teal-icon rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-teal font-medium mb-1">Unique Roles</p>
                <p className="text-2xl font-bold text-card-teal">{statistics.uniqueRoles}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-pink-gradient rounded-2xl p-6 border-2 border-card-pink">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-pink-icon rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-pink font-medium mb-1">Available Slots</p>
                <p className="text-2xl font-bold text-card-pink">{slots.length}</p>
              </div>
            </div>
          </div>
        </div>

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

      {/* View Details Dialog */}
      <Dialog open={!!viewDoctor} onOpenChange={() => setViewDoctor(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6 text-primary" />
              Doctor Details
            </DialogTitle>
          </DialogHeader>

          {viewDoctor && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="guest">Guest User</TabsTrigger>
                <TabsTrigger value="access">Access & Roles</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-foreground">
                          {viewDoctor.guest_user?.name}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            viewDoctor.is_active
                              ? 'bg-success/10 border-success text-success'
                              : 'bg-destructive/10 border-destructive text-destructive'
                          }`}
                        >
                          {viewDoctor.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Doctor Information
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">LDAP ID:</span>
                                <span className="font-medium">{viewDoctor.ldapid}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-medium">{viewDoctor.email}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Department:</span>
                                <span className="font-medium">{viewDoctor.department}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              System Access
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Status:</span>
                                <span className="font-medium">
                                  {viewDoctor.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Guest User:</span>
                                <span className="font-medium">
                                  {viewDoctor.guest_user?.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Roles Count:</span>
                                <span className="font-medium">
                                  {viewDoctor.guest_user?.roles?.length || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="guest" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Guest User Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">LDAP ID:</span>
                          <p className="font-medium">{viewDoctor.guest_user?.ldapid}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">ID Number:</span>
                          <p className="font-medium">{viewDoctor.guest_user?.idNumber}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Full Name:</span>
                          <p className="font-medium">{viewDoctor.guest_user?.name}</p>
                        </div>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <p className="font-medium">
                            {viewDoctor.guest_user?.is_active ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <p className="font-medium">
                            {viewDoctor.created_at
                              ? new Date(viewDoctor.created_at).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Updated:</span>
                          <p className="font-medium">
                            {viewDoctor.updated_at
                              ? new Date(viewDoctor.updated_at).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="access" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Roles & Permissions
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Assigned Roles:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {viewDoctor.guest_user?.roles?.map((role, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                            >
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Slot Dialog */}
      <Dialog open={!!slotDoctor} onOpenChange={() => setSlotDoctor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Assign Slots to {slotDoctor?.guest_user?.name}
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
                        <strong>Name:</strong> {slotDoctor?.guest_user?.name}
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
                    <h4 className="font-semibold mb-2">Slot Assignment</h4>
                    {slotsLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Loading available slots...</span>
                      </div>
                    ) : (
                      <DynamicForm
                        schema={slotAssignmentSchema}
                        onSubmit={setSlotFormData}
                        defaultValues={slotFormData}
                        onChange={setSlotFormData}
                        submitButtonText="Update Selection"
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

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setSlotDoctor(null)}
                disabled={assignSlotsMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSlotSubmit}
                disabled={
                  assignSlotsMutation.isPending ||
                  !slotFormData.slot_ids ||
                  slotFormData.slot_ids.length === 0
                }
                className="flex items-center gap-2"
              >
                {assignSlotsMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {assignSlotsMutation.isPending ? 'Assigning...' : 'Assign Slots'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </HelmetWrapper>
  );
};

export default DoctorsManagement;
