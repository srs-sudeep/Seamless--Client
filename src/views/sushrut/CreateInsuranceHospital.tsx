import { useState } from 'react';
import { DynamicForm, HelmetWrapper, toast, Card, CardContent, Button } from '@/components';
import { useCreateInsuranceHospital } from '@/hooks/sushrut/insuranceHospital.hook';
import { CreateInsuranceHospitalPayload, type FieldType } from '@/types';
import {
  Building2,
  User,
  Phone,
  Mail,
  Shield,
  DollarSign,
  CheckCircle,
  AlertCircle,
  FileText,
  CreditCard,
} from 'lucide-react';

const hospitalBasicSchema: FieldType[] = [
  {
    name: 'hospital_name',
    label: 'Hospital Name',
    type: 'text',
    required: true,
    columns: 1,
    placeholder: 'Enter hospital name',
    section: 'Basic Information',
  },
  {
    name: 'tpa',
    label: 'TPA (Third Party Administrator)',
    type: 'text',
    required: true,
    columns: 1,
    placeholder: 'Enter TPA name',
    section: 'Basic Information',
  },
  {
    name: 'authorised_person',
    label: 'Authorised Person',
    type: 'text',
    required: true,
    columns: 1,
    placeholder: 'Enter authorised person name',
    section: 'Basic Information',
  },
  {
    name: 'ward_entitle',
    label: 'Ward Entitlement',
    type: 'text',
    required: true,
    columns: 1,
    placeholder: 'Enter ward entitlement details',
    section: 'Basic Information',
  },
];

const contactSchema: FieldType[] = [
  {
    name: 'contact_no',
    label: 'Contact Number',
    type: 'text',
    required: true,
    columns: 1,
    placeholder: 'Enter contact number',
    section: 'Contact Information',
  },
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    required: true,
    columns: 1,
    placeholder: 'Enter email address',
    section: 'Contact Information',
  },
];

const insuranceSchema: FieldType[] = [
  {
    name: 'medical_claim_sum_insured',
    label: 'Medical Claim Sum Insured',
    type: 'number',
    required: true,
    columns: 1,
    placeholder: '0',
    section: 'Insurance Coverage',
  },
  {
    name: 'accidental_claim_sum_insured',
    label: 'Accidental Claim Sum Insured',
    type: 'number',
    required: true,
    columns: 1,
    placeholder: '0',
    section: 'Insurance Coverage',
  },
  {
    name: 'accidental_death_or_permanent_disability',
    label: 'Accidental Death/Permanent Disability',
    type: 'number',
    required: true,
    columns: 1,
    placeholder: '0',
    section: 'Insurance Coverage',
  },
  {
    name: 'loss_of_laptop',
    label: 'Loss of Laptop Coverage',
    type: 'number',
    required: true,
    columns: 1,
    placeholder: '0',
    section: 'Insurance Coverage',
  },
  {
    name: 'damage_or_loss_of_baggage',
    label: 'Damage/Loss of Baggage Coverage',
    type: 'number',
    required: true,
    columns: 1,
    placeholder: '0',
    section: 'Insurance Coverage',
  },
  {
    name: 'buffer_amount',
    label: 'Buffer Amount',
    type: 'number',
    required: true,
    columns: 1,
    placeholder: '0',
    section: 'Insurance Coverage',
  },
];

const CreateInsuranceHospital = () => {
  const createMutation = useCreateInsuranceHospital();
  const [basicData, setBasicData] = useState<Record<string, any>>({});
  const [contactData, setContactData] = useState<Record<string, any>>({});
  const [insuranceData, setInsuranceData] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const calculateTotalCoverage = () => {
    return (
      (Number(insuranceData.medical_claim_sum_insured) || 0) +
      (Number(insuranceData.accidental_claim_sum_insured) || 0) +
      (Number(insuranceData.accidental_death_or_permanent_disability) || 0) +
      (Number(insuranceData.loss_of_laptop) || 0) +
      (Number(insuranceData.damage_or_loss_of_baggage) || 0) +
      (Number(insuranceData.buffer_amount) || 0)
    );
  };

  const handleSubmit = async () => {
    const allData = { ...basicData, ...contactData, ...insuranceData };

    // Basic validation
    const requiredFields = [
      'hospital_name',
      'tpa',
      'authorised_person',
      'contact_no',
      'email',
      'ward_entitle',
      'medical_claim_sum_insured',
      'accidental_claim_sum_insured',
      'accidental_death_or_permanent_disability',
      'loss_of_laptop',
      'damage_or_loss_of_baggage',
      'buffer_amount',
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

    try {
      await createMutation.mutateAsync(allData as CreateInsuranceHospitalPayload);
      toast({
        title: 'Success!',
        description: 'Insurance hospital created successfully',
      });
      setIsSubmitted(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setBasicData({});
        setContactData({});
        setInsuranceData({});
        setIsSubmitted(false);
      }, 3000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create insurance hospital. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const isFormComplete = () => {
    return (
      basicData.hospital_name &&
      contactData.email &&
      insuranceData.medical_claim_sum_insured !== undefined
    );
  };

  return (
    <HelmetWrapper
      title="Create Insurance Hospital | Sushrut"
      heading="Create Insurance Hospital"
      subHeading="Add a new insurance hospital with comprehensive coverage details"
    >
      <div className="space-y-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card-blue-gradient rounded-2xl p-6 border-2 border-card-blue">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-card-blue-icon rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-card-blue font-medium">Hospital Info</p>
                <p className="text-lg font-bold text-card-blue">
                  {Object.keys(basicData).length > 0 ? 'Complete' : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card-green-gradient rounded-2xl p-6 border-2 border-card-green">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-card-green-icon rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-card-green font-medium">Contact Info</p>
                <p className="text-lg font-bold text-card-green">
                  {Object.keys(contactData).length > 0 ? 'Complete' : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card-purple-gradient rounded-2xl p-6 border-2 border-card-purple">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-card-purple-icon rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-card-purple font-medium">Insurance Info</p>
                <p className="text-lg font-bold text-card-purple">
                  {Object.keys(insuranceData).length > 0 ? 'Complete' : 'Pending'}
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
                <p className="text-sm text-card-orange font-medium">Total Coverage</p>
                <p className="text-lg font-bold text-card-orange">
                  ₹{calculateTotalCoverage().toLocaleString()}
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
                      <Building2 className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Basic Information</h3>
                  </div>
                  <DynamicForm
                    schema={hospitalBasicSchema}
                    onSubmit={setBasicData}
                    defaultValues={basicData}
                    onChange={setBasicData}
                    submitButtonText="Save Basic Info"
                  />
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="border-2 border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Contact Information</h3>
                  </div>
                  <DynamicForm
                    schema={contactSchema}
                    onSubmit={setContactData}
                    defaultValues={contactData}
                    onChange={setContactData}
                    submitButtonText="Save Contact Info"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Insurance Coverage */}
            <Card className="border-2 border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-info rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      Insurance Coverage Details
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Total Coverage: ₹{calculateTotalCoverage().toLocaleString()}
                    </p>
                  </div>
                </div>
                <DynamicForm
                  schema={insuranceSchema}
                  onSubmit={setInsuranceData}
                  defaultValues={insuranceData}
                  onChange={setInsuranceData}
                  submitButtonText="Save Insurance Info"
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
                {createMutation.isPending ? 'Creating...' : 'Create Insurance Hospital'}
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
                  Insurance Hospital Successfully Created!
                </h3>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                  {basicData.hospital_name} has been added to the insurance hospital network with
                  comprehensive coverage details.
                </p>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Hospital Details</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Name:</strong> {basicData.hospital_name}
                      </p>
                      <p>
                        <strong>TPA:</strong> {basicData.tpa}
                      </p>
                      <p>
                        <strong>Contact:</strong> {contactData.contact_no}
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <Shield className="w-8 h-8 text-info mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Main Coverage</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Medical:</strong> ₹
                        {Number(insuranceData.medical_claim_sum_insured).toLocaleString()}
                      </p>
                      <p>
                        <strong>Accidental:</strong> ₹
                        {Number(insuranceData.accidental_claim_sum_insured).toLocaleString()}
                      </p>
                      <p>
                        <strong>Buffer:</strong> ₹
                        {Number(insuranceData.buffer_amount).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <CreditCard className="w-8 h-8 text-success mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Total Coverage</h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-2xl font-bold text-success">
                        ₹{calculateTotalCoverage().toLocaleString()}
                      </p>
                      <p className="text-muted-foreground">Complete insurance package</p>
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
                    <li>• All amount fields should be entered in INR (Indian Rupees)</li>
                    <li>• TPA (Third Party Administrator) handles insurance claim processing</li>
                    <li>
                      • Authorised person will be the primary contact for all insurance matters
                    </li>
                    <li>• Buffer amount provides additional coverage beyond standard limits</li>
                    <li>
                      • Ward entitlement determines the type of hospital accommodation covered
                    </li>
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

export default CreateInsuranceHospital;
