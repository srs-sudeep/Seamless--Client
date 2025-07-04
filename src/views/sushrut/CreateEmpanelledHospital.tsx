import { useState } from 'react';
import { DynamicForm, HelmetWrapper, toast, Card, CardContent } from '@/components';
import { useCreateEmpanelledHospital } from '@/hooks';
import { CreateEmpanelledHospitalPayload, type FieldType } from '@/types';
import { Building2, MapPin, Hospital, CheckCircle, AlertCircle } from 'lucide-react';

const hospitalSchema: FieldType[] = [
  {
    name: 'hospital_name',
    label: 'Hospital Name',
    type: 'text',
    required: true,
    columns: 1,
    placeholder: 'Enter hospital name',
    section: 'Hospital Information',
  },
  {
    name: 'address',
    label: 'Hospital Address',
    type: 'textarea',
    required: true,
    columns: 1,
    placeholder: 'Enter complete hospital address',
    section: 'Hospital Information',
  },
];

const CreateEmpanelledHospital = () => {
  const createMutation = useCreateEmpanelledHospital();
  const [hospitalData, setHospitalData] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (data: Record<string, any>) => {
    if (!data.hospital_name || !data.address) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createMutation.mutateAsync(data as CreateEmpanelledHospitalPayload);
      toast({
        title: 'Success!',
        description: 'Empanelled hospital created successfully',
      });
      setIsSubmitted(true);

      // Reset form after 2 seconds
      setTimeout(() => {
        setHospitalData({});
        setIsSubmitted(false);
      }, 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create hospital. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <HelmetWrapper
      title="Create Empanelled Hospital | Sushrut"
      heading="Create Empanelled Hospital"
      subHeading="Add a new hospital to the empanelled network for medical claims"
    >
      <div className="space-y-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card-blue-gradient rounded-2xl p-6 border-2 border-card-blue">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-card-blue-icon rounded-xl flex items-center justify-center">
                <Hospital className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-card-blue font-medium">Hospital Info</p>
                <p className="text-lg font-bold text-card-blue">
                  {hospitalData.hospital_name ? 'Ready' : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card-green-gradient rounded-2xl p-6 border-2 border-card-green">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-card-green-icon rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-card-green font-medium">Address Info</p>
                <p className="text-lg font-bold text-card-green">
                  {hospitalData.address ? 'Complete' : 'Missing'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card-purple-gradient rounded-2xl p-6 border-2 border-card-purple">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-card-purple-icon rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-card-purple font-medium">Network Status</p>
                <p className="text-lg font-bold text-card-purple">
                  {isSubmitted ? 'Empanelled' : 'Not Added'}
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
                <p className="text-sm text-card-orange font-medium">Form Status</p>
                <p className="text-lg font-bold text-card-orange">
                  {isSubmitted
                    ? 'Submitted'
                    : hospitalData.hospital_name && hospitalData.address
                      ? 'Complete'
                      : 'Incomplete'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Hospital Information Form */}
        <Card className="border-2 border-border shadow-lg ">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Hospital className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">Hospital Details</h3>
                <p className="text-muted-foreground">
                  Enter the hospital information to add it to the empanelled network
                </p>
              </div>
            </div>

            {!isSubmitted ? (
              <DynamicForm
                schema={hospitalSchema}
                onSubmit={handleSubmit}
                defaultValues={hospitalData}
                onChange={setHospitalData}
                submitButtonText={
                  createMutation.isPending ? 'Creating Hospital...' : 'Create Empanelled Hospital'
                }
              />
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-success" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Hospital Successfully Created!
                </h3>
                <p className="text-muted-foreground mb-6">
                  {hospitalData.hospital_name} has been added to the empanelled hospital network.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 max-w-md mx-auto">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hospital Name:</span>
                      <span className="font-medium">{hospitalData.hospital_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Address:</span>
                      <span className="font-medium text-right max-w-48">
                        {hospitalData.address}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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
                    <li>• Ensure the hospital name is accurate and matches official records</li>
                    <li>• Provide complete address including city, state, and postal code</li>
                    <li>• Once added, the hospital will be available for medical claims</li>
                    <li>• Hospital information can be updated later if needed</li>
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

export default CreateEmpanelledHospital;
