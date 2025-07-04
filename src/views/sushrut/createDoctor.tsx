import { useState } from 'react';
import { DynamicForm, HelmetWrapper, toast, Card, CardContent, Button } from '@/components';
import { useCreateDoctor } from '@/hooks/sushrut/useDoctor.hook';
import { type FieldType } from '@/types';
import {
  User,
  Mail,
  Building,
  Shield,
  CheckCircle,
  AlertCircle,
  UserPlus,
  IdCard,
} from 'lucide-react';

const doctorBasicSchema: FieldType[] = [
  {
    name: 'ldapid',
    label: 'LDAP ID',
    type: 'text',
    required: true,
    columns: 1,
    placeholder: 'Enter LDAP ID',
    section: 'Doctor Information',
  },
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    required: true,
    columns: 1,
    placeholder: 'Enter email address',
    section: 'Doctor Information',
  },
  {
    name: 'department',
    label: 'Department',
    type: 'text',
    required: true,
    columns: 1,
    placeholder: 'Enter department',
    section: 'Doctor Information',
  },
  {
    name: 'is_active',
    label: 'Active Status',
    type: 'toggle',
    required: true,
    columns: 1,
    section: 'Doctor Information',
  },
];

const guestUserSchema: FieldType[] = [
  {
    name: 'guest_user.ldapid',
    label: 'Guest User LDAP ID',
    type: 'text',
    required: true,
    columns: 1,
    placeholder: 'Enter guest user LDAP ID',
    section: 'Guest User Information',
  },
  {
    name: 'guest_user.idNumber',
    label: 'ID Number',
    type: 'text',
    required: true,
    columns: 1,
    placeholder: 'Enter ID number',
    section: 'Guest User Information',
  },
  {
    name: 'guest_user.name',
    label: 'Full Name',
    type: 'text',
    required: true,
    columns: 1,
    placeholder: 'Enter full name',
    section: 'Guest User Information',
  },
  {
    name: 'guest_user.password',
    label: 'Password',
    type: 'password',
    required: true,
    columns: 1,
    placeholder: 'Enter password',
    section: 'Guest User Information',
  },
  {
    name: 'guest_user.is_active',
    label: 'Guest User Active',
    type: 'toggle',
    required: true,
    columns: 1,
    section: 'Guest User Information',
  },
  {
    name: 'guest_user.roles',
    label: 'Roles',
    type: 'multiselect',
    required: true,
    columns: 1,
    options: [
      { value: 'doctor', label: 'Doctor' },
      { value: 'admin', label: 'Admin' },
      { value: 'specialist', label: 'Specialist' },
      { value: 'consultant', label: 'Consultant' },
    ],
    section: 'Guest User Information',
  },
];

const CreateDoctor = () => {
  const createMutation = useCreateDoctor();
  const [doctorData, setDoctorData] = useState<Record<string, any>>({});
  const [guestUserData, setGuestUserData] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    // Construct payload to match CreateDoctorPayload
    const payload = {
      ldapid: doctorData.ldapid,
      email: doctorData.email,
      department: doctorData.department,
      is_active: doctorData.is_active,
      guest_user: {
        ldapid: guestUserData['guest_user.ldapid'],
        idNumber: guestUserData['guest_user.idNumber'],
        name: guestUserData['guest_user.name'],
        password: guestUserData['guest_user.password'],
        is_active: guestUserData['guest_user.is_active'],
        roles: guestUserData['guest_user.roles'],
      },
    };

    // Basic validation
    const requiredFields = [
      'ldapid',
      'email',
      'department',
      'is_active',
      'guest_user.ldapid',
      'guest_user.idNumber',
      'guest_user.name',
      'guest_user.password',
      'guest_user.is_active',
      'guest_user.roles',
    ];

    const missingFields = requiredFields.filter(field => {
      const value = field.includes('.')
        ? field.split('.').reduce((obj, key) => obj?.[key], payload as any)
        : (payload as any)[field];
      return !value && value !== false;
    });

    if (missingFields.length > 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createMutation.mutateAsync(payload);
      toast({
        title: 'Success!',
        description: 'Doctor created successfully',
      });
      setIsSubmitted(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setDoctorData({});
        setGuestUserData({});
        setIsSubmitted(false);
      }, 3000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create doctor. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const isFormComplete = () => {
    return doctorData.ldapid && doctorData.email && guestUserData['guest_user.name'];
  };

  return (
    <HelmetWrapper
      title="Create Doctor | Sushrut"
      heading="Create Doctor"
      subHeading="Add a new doctor to the system with guest user credentials"
    >
      <div className="space-y-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card-blue-gradient rounded-2xl p-6 border-2 border-card-blue">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-card-blue-icon rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-card-blue font-medium">Doctor Info</p>
                <p className="text-lg font-bold text-card-blue">
                  {Object.keys(doctorData).length > 0 ? 'Complete' : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card-green-gradient rounded-2xl p-6 border-2 border-card-green">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-card-green-icon rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-card-green font-medium">Guest User</p>
                <p className="text-lg font-bold text-card-green">
                  {Object.keys(guestUserData).length > 0 ? 'Complete' : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card-purple-gradient rounded-2xl p-6 border-2 border-card-purple">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-card-purple-icon rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-card-purple font-medium">Department</p>
                <p className="text-lg font-bold text-card-purple">
                  {doctorData.department || 'Not Set'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card-orange-gradient rounded-2xl p-6 border-2 border-card-orange">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-card-orange-icon rounded-xl flex items-center justify-center">
                {isSubmitted ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <p className="text-sm text-card-orange font-medium">Status</p>
                <p className="text-lg font-bold text-card-orange">
                  {isSubmitted ? 'Created' : isFormComplete() ? 'Ready' : 'Incomplete'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {!isSubmitted ? (
          <>
            {/* Form Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Doctor Information */}
              <Card className="border-2 border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Doctor Information</h3>
                  </div>
                  <DynamicForm
                    schema={doctorBasicSchema}
                    onSubmit={setDoctorData}
                    defaultValues={doctorData}
                    onChange={setDoctorData}
                    submitButtonText="Save Doctor Info"
                  />
                </CardContent>
              </Card>

              {/* Guest User Information */}
              <Card className="border-2 border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Guest User Information</h3>
                  </div>
                  <DynamicForm
                    schema={guestUserSchema}
                    onSubmit={setGuestUserData}
                    defaultValues={guestUserData}
                    onChange={setGuestUserData}
                    submitButtonText="Save Guest User Info"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || !isFormComplete()}
                size="lg"
                className="px-12 h-12 text-lg font-semibold"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Doctor'}
              </Button>
            </div>
          </>
        ) : (
          /* Success State */
          <Card className="border-2 border-success">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-success" />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-4">
                  Doctor Successfully Created!
                </h3>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Dr. {guestUserData['guest_user.name']} has been added to the{' '}
                  {doctorData.department} department.
                </p>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <User className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Doctor Details</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Name:</strong> {guestUserData['guest_user.name']}
                      </p>
                      <p>
                        <strong>LDAP ID:</strong> {doctorData.ldapid}
                      </p>
                      <p>
                        <strong>Email:</strong> {doctorData.email}
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <Building className="w-8 h-8 text-info mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Department</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Department:</strong> {doctorData.department}
                      </p>
                      <p>
                        <strong>Status:</strong> {doctorData.is_active ? 'Active' : 'Inactive'}
                      </p>
                      <p>
                        <strong>ID Number:</strong> {guestUserData['guest_user.idNumber']}
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <Shield className="w-8 h-8 text-success mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Access & Roles</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Guest User:</strong>{' '}
                        {guestUserData['guest_user.is_active'] ? 'Active' : 'Inactive'}
                      </p>
                      <p>
                        <strong>Roles:</strong> {guestUserData['guest_user.roles']?.join(', ')}
                      </p>
                      <p>
                        <strong>LDAP ID:</strong> {guestUserData['guest_user.ldapid']}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Information Section */}
        {!isSubmitted && (
          <Card className="border border-info/20 bg-info/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-info/10 rounded-lg flex items-center justify-center mt-1">
                  <AlertCircle className="w-4 h-4 text-info" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-info mb-2">Important Information</h4>
                  <ul className="text-sm text-info/80 space-y-1">
                    <li>• LDAP ID should be unique and follow organizational standards</li>
                    <li>• Guest user will have access to the system with specified roles</li>
                    <li>• Password should be strong and secure</li>
                    <li>• Roles determine the level of access within the system</li>
                    <li>• Both doctor and guest user can be activated/deactivated independently</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </HelmetWrapper>
  );
};

export default CreateDoctor;
