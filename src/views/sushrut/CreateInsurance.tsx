import { useState } from 'react';
import { DynamicForm, HelmetWrapper, toast, Card, CardContent, Button } from '@/components';
import { useCreateInsurance } from '@/hooks/sushrut/insurance.hook';
import { CreateInsurancePayload, type FieldType } from '@/types';
import {
  Shield,
  FileText,
  Calendar,
  Building,
  DollarSign,
  CheckCircle,
  AlertCircle,
  User,
  Activity,
} from 'lucide-react';

const policyBasicSchema: FieldType[] = [
  {
    name: 'session_year',
    label: 'Session Year',
    type: 'text',
    required: true,
    columns: 1,
    placeholder: 'e.g., 2024-2025',
    section: 'Policy Basic Information',
  },
  {
    name: 'policy_number',
    label: 'Policy Number',
    type: 'text',
    required: true,
    columns: 1,
    placeholder: 'Enter policy number',
    section: 'Policy Basic Information',
  },
  {
    name: 'policy_holder_name',
    label: 'Policy Holder Name',
    type: 'text',
    required: true,
    columns: 1,
    placeholder: 'Enter policy holder name',
    section: 'Policy Basic Information',
  },
  {
    name: 'insurance_company',
    label: 'Insurance Company',
    type: 'text',
    required: true,
    columns: 1,
    placeholder: 'Enter insurance company name',
    section: 'Policy Basic Information',
  },
];

const policyDetailsSchema: FieldType[] = [
  {
    name: 'medical_claim_policy_no',
    label: 'Medical Claim Policy Number',
    type: 'text',
    required: true,
    columns: 1,
    placeholder: 'Enter medical claim policy number',
    section: 'Policy Details',
  },
  {
    name: 'accidental_claim_policy_no',
    label: 'Accidental Claim Policy Number',
    type: 'text',
    required: true,
    columns: 1,
    placeholder: 'Enter accidental claim policy number',
    section: 'Policy Details',
  },
  {
    name: 'period_of_insurance',
    label: 'Period of Insurance',
    type: 'text',
    required: true,
    columns: 1,
    placeholder: 'e.g., 12 months',
    section: 'Policy Details',
  },
  {
    name: 'coverage_amount',
    label: 'Coverage Amount',
    type: 'number',
    required: true,
    columns: 1,
    placeholder: '0',
    section: 'Policy Details',
  },
];

const policyDatesSchema: FieldType[] = [
  {
    name: 'policy_start_date',
    label: 'Policy Start Date',
    type: 'date',
    required: true,
    columns: 1,
    section: 'Policy Dates',
  },
  {
    name: 'policy_end_date',
    label: 'Policy End Date',
    type: 'date',
    required: true,
    columns: 1,
    section: 'Policy Dates',
  },
  {
    name: 'policy_status',
    label: 'Policy Status',
    type: 'select',
    required: true,
    columns: 1,
    options: [
      { value: 'ACTIVE', label: 'Active' },
      { value: 'INACTIVE', label: 'Inactive' },
      { value: 'EXPIRED', label: 'Expired' },
      { value: 'PENDING', label: 'Pending' },
      { value: 'CANCELLED', label: 'Cancelled' },
    ],
    section: 'Policy Dates',
  },
];

const CreateInsurance = () => {
  const createMutation = useCreateInsurance();
  const [basicData, setBasicData] = useState<Record<string, any>>({});
  const [detailsData, setDetailsData] = useState<Record<string, any>>({});
  const [datesData, setDatesData] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const calculatePolicyDuration = () => {
    if (datesData.policy_start_date && datesData.policy_end_date) {
      const start = new Date(datesData.policy_start_date);
      const end = new Date(datesData.policy_end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const isExpiringSoon = () => {
    if (datesData.policy_end_date) {
      const end = new Date(datesData.policy_end_date);
      const today = new Date();
      const diffTime = end.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0;
    }
    return false;
  };

  const handleSubmit = async () => {
    const allData = { ...basicData, ...detailsData, ...datesData };

    // Basic validation
    const requiredFields = [
      'session_year',
      'medical_claim_policy_no',
      'accidental_claim_policy_no',
      'period_of_insurance',
      'insurance_company',
      'policy_number',
      'policy_holder_name',
      'coverage_amount',
      'policy_start_date',
      'policy_end_date',
      'policy_status',
    ];

    const missingFields = requiredFields.filter(field => !allData[field] && allData[field] !== 0);

    if (missingFields.length > 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Date validation
    if (new Date(allData.policy_start_date) >= new Date(allData.policy_end_date)) {
      toast({
        title: 'Date Error',
        description: 'Policy end date must be after start date',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createMutation.mutateAsync(allData as CreateInsurancePayload);
      toast({
        title: 'Success!',
        description: 'Insurance policy created successfully',
      });
      setIsSubmitted(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setBasicData({});
        setDetailsData({});
        setDatesData({});
        setIsSubmitted(false);
      }, 3000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create insurance policy. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const isFormComplete = () => {
    return (
      basicData.policy_number && detailsData.medical_claim_policy_no && datesData.policy_start_date
    );
  };

  return (
    <HelmetWrapper
      title="Create Insurance Policy | Sushrut"
      heading="Create Insurance Policy"
      subHeading="Create a new insurance policy with comprehensive coverage details"
    >
      <div className="space-y-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card-blue-gradient rounded-2xl p-6 border-2 border-card-blue">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-card-blue-icon rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-card-blue font-medium">Basic Info</p>
                <p className="text-lg font-bold text-card-blue">
                  {Object.keys(basicData).length > 0 ? 'Complete' : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card-green-gradient rounded-2xl p-6 border-2 border-card-green">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-card-green-icon rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-card-green font-medium">Policy Details</p>
                <p className="text-lg font-bold text-card-green">
                  {Object.keys(detailsData).length > 0 ? 'Complete' : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card-purple-gradient rounded-2xl p-6 border-2 border-card-purple">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-card-purple-icon rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-card-purple font-medium">Duration</p>
                <p className="text-lg font-bold text-card-purple">
                  {calculatePolicyDuration() > 0 ? `${calculatePolicyDuration()} days` : 'Not Set'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card-orange-gradient rounded-2xl p-6 border-2 border-card-orange">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-card-orange-icon rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-card-orange font-medium">Coverage</p>
                <p className="text-lg font-bold text-card-orange">
                  ₹{(detailsData.coverage_amount || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {!isSubmitted ? (
          <>
            {/* Form Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <Card className="border-2 border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Basic Information</h3>
                  </div>
                  <DynamicForm
                    schema={policyBasicSchema}
                    onSubmit={setBasicData}
                    defaultValues={basicData}
                    onChange={setBasicData}
                    submitButtonText="Save Basic Info"
                  />
                </CardContent>
              </Card>

              {/* Policy Details */}
              <Card className="border-2 border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Policy Details</h3>
                  </div>
                  <DynamicForm
                    schema={policyDetailsSchema}
                    onSubmit={setDetailsData}
                    defaultValues={detailsData}
                    onChange={setDetailsData}
                    submitButtonText="Save Policy Details"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Policy Dates & Status */}
            <Card className="border-2 border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-info rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Policy Dates & Status</h3>
                    {isExpiringSoon() && (
                      <p className="text-sm text-warning font-medium">
                        ⚠️ Policy expires within 30 days
                      </p>
                    )}
                  </div>
                </div>
                <DynamicForm
                  schema={policyDatesSchema}
                  onSubmit={setDatesData}
                  defaultValues={datesData}
                  onChange={setDatesData}
                  submitButtonText="Save Dates & Status"
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || !isFormComplete()}
                size="lg"
                className="px-12 h-12 text-lg font-semibold"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Insurance Policy'}
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
                  Insurance Policy Successfully Created!
                </h3>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Policy {basicData.policy_number} for {basicData.policy_holder_name} has been
                  created with comprehensive coverage.
                </p>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <User className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Policy Holder</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Name:</strong> {basicData.policy_holder_name}
                      </p>
                      <p>
                        <strong>Policy No:</strong> {basicData.policy_number}
                      </p>
                      <p>
                        <strong>Session:</strong> {basicData.session_year}
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <Building className="w-8 h-8 text-info mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Insurance Details</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Company:</strong> {basicData.insurance_company}
                      </p>
                      <p>
                        <strong>Period:</strong> {detailsData.period_of_insurance}
                      </p>
                      <p>
                        <strong>Status:</strong> {datesData.policy_status}
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <Activity className="w-8 h-8 text-success mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Coverage & Duration</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Coverage:</strong> ₹
                        {Number(detailsData.coverage_amount).toLocaleString()}
                      </p>
                      <p>
                        <strong>Duration:</strong> {calculatePolicyDuration()} days
                      </p>
                      <p>
                        <strong>Valid Till:</strong>{' '}
                        {new Date(datesData.policy_end_date).toLocaleDateString()}
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
                    <li>• Session year should follow the format YYYY-YYYY (e.g., 2024-2025)</li>
                    <li>• Medical and accidental claim policy numbers should be unique</li>
                    <li>• Policy end date must be after the start date</li>
                    <li>• Coverage amount should be entered in INR (Indian Rupees)</li>
                    <li>• Policy status can be changed later if needed</li>
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

export default CreateInsurance;
