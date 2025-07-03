import { useState, useMemo } from 'react';
import {
  DynamicForm,
  HelmetWrapper,
  toast,
  Card,
  CardContent,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components';
import { useCreateFacultyIPDClaim } from '@/hooks/sushrut/facultyIPD.hook';
import { HospitalExpenses, type FieldType } from '@/types';
import {
  User,
  Stethoscope,
  FileText,
  Receipt,
  DollarSign,
  UserCheck,
  ClipboardList,
} from 'lucide-react';

const claimantSchema: FieldType[] = [
  {
    name: 'claimant_name',
    label: 'Claimant Name',
    type: 'text',
    required: true,
    columns: 1,
  },
  {
    name: 'employee_code',
    label: 'Employee Code',
    type: 'text',
    required: true,
    columns: 1,
  },
  {
    name: 'designation',
    label: 'Designation',
    type: 'text',
    required: true,
    columns: 1,
  },
  {
    name: 'telephone',
    label: 'Telephone',
    type: 'text',
    required: true,
    columns: 1,
  },
  {
    name: 'department',
    label: 'Department',
    type: 'text',
    required: true,
    columns: 1,
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    columns: 1,
  },
  {
    name: 'ward_entitlement',
    label: 'Ward Entitlement',
    type: 'text',
    required: true,
    columns: 1,
  },
  {
    name: 'pay_band_grade',
    label: 'Pay Band Grade',
    type: 'text',
    required: true,
    columns: 1,
  },
];

const patientSchema: FieldType[] = [
  {
    name: 'patient_name',
    label: 'Patient Name',
    type: 'text',
    required: true,
    columns: 1,
  },
  {
    name: 'relationship_to_claimant',
    label: 'Relationship to Claimant',
    type: 'text',
    required: true,
    columns: 1,
  },
  {
    name: 'illness_description',
    label: 'Illness Description',
    type: 'textarea',
    required: true,
    columns: 1,
  },
  {
    name: 'illness_period',
    label: 'Illness Period',
    type: 'text',
    required: true,
    columns: 1,
  },
  {
    name: 'referring_ama',
    label: 'Referring AMA',
    type: 'text',
    required: true,
    columns: 1,
  },
  {
    name: 'referring_date',
    label: 'Referring Date',
    type: 'date',
    required: true,
    columns: 1,
  },
  {
    name: 'referred_hospital',
    label: 'Referred Hospital',
    type: 'text',
    required: true,
    columns: 1,
  },
];

const facultyIPDSchema: FieldType[] = [
  {
    name: 'total_claim_submitted',
    label: 'Total Claim Submitted',
    type: 'number',
    required: true,
    columns: 1,
  },
  {
    name: 'total_enclosures',
    label: 'Total Enclosures',
    type: 'number',
    required: true,
    columns: 1,
  },
  {
    name: 'advance_taken',
    label: 'Advance Taken',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'total_amount_recommended',
    label: 'Total Amount Recommended',
    type: 'number',
    required: true,
    columns: 1,
  },
  {
    name: 'declaration_date',
    label: 'Declaration Date',
    type: 'date',
    required: true,
    columns: 1,
  },
];

// Hospital expenses schemas - split into categories for better UX
const accommodationSchema: FieldType[] = [
  {
    name: 'accommodation_claimed',
    label: 'Accommodation Claimed',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'accommodation_recommended',
    label: 'Accommodation Recommended',
    type: 'number',
    required: false,
    columns: 1,
  },
];

const consultationSchema: FieldType[] = [
  {
    name: 'registration_fee_claimed',
    label: 'Registration Fee Claimed',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'registration_fee_recommended',
    label: 'Registration Fee Recommended',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'consultation_claimed',
    label: 'Consultation Claimed',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'consultation_recommended',
    label: 'Consultation Recommended',
    type: 'number',
    required: false,
    columns: 1,
  },
];

const surgerySchema: FieldType[] = [
  {
    name: 'surgeon_charges_claimed',
    label: 'Surgeon Charges Claimed',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'surgeon_charges_recommended',
    label: 'Surgeon Charges Recommended',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'nursing_charges_claimed',
    label: 'Nursing Charges Claimed',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'nursing_charges_recommended',
    label: 'Nursing Charges Recommended',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'ot_charges_claimed',
    label: 'OT Charges Claimed',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'ot_charges_recommended',
    label: 'OT Charges Recommended',
    type: 'number',
    required: false,
    columns: 1,
  },
];

const diagnosticsSchema: FieldType[] = [
  { name: 'xray_claimed', label: 'X-Ray Claimed', type: 'number', required: false, columns: 1 },
  {
    name: 'xray_recommended',
    label: 'X-Ray Recommended',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'imaging_claimed',
    label: 'Imaging Claimed',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'imaging_recommended',
    label: 'Imaging Recommended',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'diagnostic_claimed',
    label: 'Diagnostic Claimed',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'diagnostic_recommended',
    label: 'Diagnostic Recommended',
    type: 'number',
    required: false,
    columns: 1,
  },
  { name: 'ecg_claimed', label: 'ECG Claimed', type: 'number', required: false, columns: 1 },
  {
    name: 'ecg_recommended',
    label: 'ECG Recommended',
    type: 'number',
    required: false,
    columns: 1,
  },
];

const treatmentSchema: FieldType[] = [
  {
    name: 'medicine_claimed',
    label: 'Medicine Claimed',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'medicine_recommended',
    label: 'Medicine Recommended',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'market_medicine_claimed',
    label: 'Market Medicine Claimed',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'market_medicine_recommended',
    label: 'Market Medicine Recommended',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'physiotherapy_claimed',
    label: 'Physiotherapy Claimed',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'physiotherapy_recommended',
    label: 'Physiotherapy Recommended',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'angioplasty_claimed',
    label: 'Angioplasty Claimed',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'angioplasty_recommended',
    label: 'Angioplasty Recommended',
    type: 'number',
    required: false,
    columns: 1,
  },
];

const othersSchema: FieldType[] = [
  {
    name: 'hospital_charges_claimed',
    label: 'Hospital Charges Claimed',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'hospital_charges_recommended',
    label: 'Hospital Charges Recommended',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'blood_charges_claimed',
    label: 'Blood Charges Claimed',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'blood_charges_recommended',
    label: 'Blood Charges Recommended',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'test_procedure_claimed',
    label: 'Test Procedure Claimed',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'test_procedure_recommended',
    label: 'Test Procedure Recommended',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'consumables_claimed',
    label: 'Consumables Claimed',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'consumables_recommended',
    label: 'Consumables Recommended',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'other_charges_claimed',
    label: 'Other Charges Claimed',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'other_charges_recommended',
    label: 'Other Charges Recommended',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'miscellaneous_claimed',
    label: 'Miscellaneous Claimed',
    type: 'number',
    required: false,
    columns: 1,
  },
  {
    name: 'miscellaneous_recommended',
    label: 'Miscellaneous Recommended',
    type: 'number',
    required: false,
    columns: 1,
  },
];

const CreateFacultyIPD = () => {
  const createMutation = useCreateFacultyIPDClaim();

  const [claimantData, setClaimantData] = useState<Record<string, any>>({});
  const [patientData, setPatientData] = useState<Record<string, any>>({});
  const [facultyIPDData, setFacultyIPDData] = useState<Record<string, any>>({});
  const [hospitalExpenses, setHospitalExpenses] = useState<Record<string, any>>({});

  // Calculate totals automatically
  const expenseTotals = useMemo(() => {
    const claimedFields = Object.keys(hospitalExpenses).filter(key => key.includes('_claimed'));
    const recommendedFields = Object.keys(hospitalExpenses).filter(key =>
      key.includes('_recommended')
    );

    const totalClaimed = claimedFields.reduce(
      (sum, field) => sum + (hospitalExpenses[field] || 0),
      0
    );
    const totalRecommended = recommendedFields.reduce(
      (sum, field) => sum + (hospitalExpenses[field] || 0),
      0
    );

    return { totalClaimed, totalRecommended };
  }, [hospitalExpenses]);

  const handleExpensesChange = (data: Record<string, any>) => {
    // Convert all number fields to numbers
    const allSchemas = [
      ...accommodationSchema,
      ...consultationSchema,
      ...surgerySchema,
      ...diagnosticsSchema,
      ...treatmentSchema,
      ...othersSchema,
    ];
    const parsed: Record<string, any> = { ...data };
    for (const field of allSchemas) {
      if (
        field.type === 'number' &&
        parsed[field.name] !== undefined &&
        parsed[field.name] !== ''
      ) {
        parsed[field.name] = Number(parsed[field.name]);
      }
    }
    const updatedData = {
      ...parsed,
      total_claimed_amount: expenseTotals.totalClaimed,
      total_recommended_amount: expenseTotals.totalRecommended,
    };
    setHospitalExpenses(updatedData);
  };

  const handleSubmit = async () => {
    if (
      !claimantData.claimant_name ||
      !patientData.patient_name ||
      !facultyIPDData.total_claim_submitted
    ) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    // List all required hospital expense fields as per HospitalExpenses type
    const allExpenseFields = [
      // Accommodation
      'accommodation_claimed',
      'accommodation_recommended',
      // Consultation
      'registration_fee_claimed',
      'registration_fee_recommended',
      'consultation_claimed',
      'consultation_recommended',
      // Surgery
      'surgeon_charges_claimed',
      'surgeon_charges_recommended',
      'nursing_charges_claimed',
      'nursing_charges_recommended',
      'ot_charges_claimed',
      'ot_charges_recommended',
      // Diagnostics
      'xray_claimed',
      'xray_recommended',
      'imaging_claimed',
      'imaging_recommended',
      'diagnostic_claimed',
      'diagnostic_recommended',
      'ecg_claimed',
      'ecg_recommended',
      // Treatment
      'medicine_claimed',
      'medicine_recommended',
      'market_medicine_claimed',
      'market_medicine_recommended',
      'physiotherapy_claimed',
      'physiotherapy_recommended',
      'angioplasty_claimed',
      'angioplasty_recommended',
      // Others
      'hospital_charges_claimed',
      'hospital_charges_recommended',
      'blood_charges_claimed',
      'blood_charges_recommended',
      'test_procedure_claimed',
      'test_procedure_recommended',
      'consumables_claimed',
      'consumables_recommended',
      'other_charges_claimed',
      'other_charges_recommended',
      'miscellaneous_claimed',
      'miscellaneous_recommended',
      // Totals
      'total_claimed_amount',
      'total_recommended_amount',
    ];

    // Ensure all fields are present in the payload, defaulting to 0 if missing
    // Import HospitalExpenses type from the correct location if not already imported
    // import type { HospitalExpenses } from '@/types'; // Uncomment if needed
    const fullHospitalExpenses: HospitalExpenses = allExpenseFields.reduce((acc, field) => {
      acc[field as keyof HospitalExpenses] = hospitalExpenses[field] ?? 0;
      return acc;
    }, {} as HospitalExpenses);

    const payload = {
      claimant: {
        claimant_name: claimantData.claimant_name,
        employee_code: claimantData.employee_code,
        designation: claimantData.designation,
        telephone: claimantData.telephone,
        department: claimantData.department,
        email: claimantData.email,
        ward_entitlement: claimantData.ward_entitlement,
        pay_band_grade: claimantData.pay_band_grade,
      },
      patient: {
        patient_name: patientData.patient_name,
        relationship_to_claimant: patientData.relationship_to_claimant,
        illness_description: patientData.illness_description,
        illness_period: patientData.illness_period,
        referring_ama: patientData.referring_ama,
        referring_date: patientData.referring_date,
        referred_hospital: patientData.referred_hospital,
      },
      faculty_ipd: {
        total_claim_submitted: facultyIPDData.total_claim_submitted,
        total_enclosures: facultyIPDData.total_enclosures,
        advance_taken: facultyIPDData.advance_taken,
        total_amount_recommended: facultyIPDData.total_amount_recommended,
        declaration_date: facultyIPDData.declaration_date,
      },
      hospital_expenses: fullHospitalExpenses,
    };

    await createMutation.mutateAsync(payload);
    toast({ title: 'Faculty IPD claim created successfully' });

    // Reset form
    setClaimantData({});
    setPatientData({});
    setFacultyIPDData({});
    setHospitalExpenses({});
  };

  return (
    <HelmetWrapper
      title="Create Faculty IPD | Sushrut"
      heading="Create Faculty IPD Claim"
      subHeading="Submit a new in-patient department medical claim for faculty members"
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
                <p className="text-sm text-card-blue font-medium">Claimant Info</p>
                <p className="text-lg font-bold text-card-blue">
                  {Object.keys(claimantData).length > 0 ? 'Completed' : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card-green-gradient rounded-2xl p-6 border-2 border-card-green">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-card-green-icon rounded-xl flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-card-green font-medium">Patient Info</p>
                <p className="text-lg font-bold text-card-green">
                  {Object.keys(patientData).length > 0 ? 'Completed' : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card-purple-gradient rounded-2xl p-6 border-2 border-card-purple">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-card-purple-icon rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-card-purple font-medium">IPD Details</p>
                <p className="text-lg font-bold text-card-purple">
                  {Object.keys(facultyIPDData).length > 0 ? 'Completed' : 'Pending'}
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
                <p className="text-sm text-card-orange font-medium">Total Claimed</p>
                <p className="text-lg font-bold text-card-orange">
                  ₹{expenseTotals.totalClaimed.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Claimant Information */}
          <Card className="border-2 border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Claimant Information</h3>
              </div>
              <DynamicForm
                schema={claimantSchema}
                onSubmit={setClaimantData}
                defaultValues={claimantData}
                onChange={setClaimantData}
                submitButtonText="Save Claimant Info"
              />
            </CardContent>
          </Card>

          {/* Patient Information */}
          <Card className="border-2 border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-secondary-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Patient Information</h3>
              </div>
              <DynamicForm
                schema={patientSchema}
                onSubmit={setPatientData}
                defaultValues={patientData}
                onChange={setPatientData}
                submitButtonText="Save Patient Info"
              />
            </CardContent>
          </Card>
        </div>

        {/* Faculty IPD Details */}
        <Card className="border-2 border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-info rounded-lg flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Faculty IPD Details</h3>
            </div>
            <DynamicForm
              schema={facultyIPDSchema}
              onSubmit={setFacultyIPDData}
              defaultValues={facultyIPDData}
              onChange={setFacultyIPDData}
              submitButtonText="Save IPD Details"
            />
          </CardContent>
        </Card>

        {/* Hospital Expenses */}
        <Card className="border-2 border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning rounded-lg flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Hospital Expenses</h3>
                  <p className="text-sm text-muted-foreground">
                    Total: ₹{expenseTotals.totalClaimed.toLocaleString()} claimed, ₹
                    {expenseTotals.totalRecommended.toLocaleString()} recommended
                  </p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="accommodation" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="accommodation">Accommodation</TabsTrigger>
                <TabsTrigger value="consultation">Consultation</TabsTrigger>
                <TabsTrigger value="surgery">Surgery</TabsTrigger>
                <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
                <TabsTrigger value="treatment">Treatment</TabsTrigger>
              </TabsList>

              <TabsContent value="accommodation" className="mt-6">
                <DynamicForm
                  schema={accommodationSchema}
                  onSubmit={handleExpensesChange}
                  defaultValues={hospitalExpenses}
                  onChange={handleExpensesChange}
                  submitButtonText="Save Accommodation"
                />
              </TabsContent>

              <TabsContent value="consultation" className="mt-6">
                <DynamicForm
                  schema={consultationSchema}
                  onSubmit={handleExpensesChange}
                  defaultValues={hospitalExpenses}
                  onChange={handleExpensesChange}
                  submitButtonText="Save Consultation"
                />
              </TabsContent>

              <TabsContent value="surgery" className="mt-6">
                <DynamicForm
                  schema={surgerySchema}
                  onSubmit={handleExpensesChange}
                  defaultValues={hospitalExpenses}
                  onChange={handleExpensesChange}
                  submitButtonText="Save Surgery Details"
                />
              </TabsContent>

              <TabsContent value="diagnostics" className="mt-6">
                <DynamicForm
                  schema={diagnosticsSchema}
                  onSubmit={handleExpensesChange}
                  defaultValues={hospitalExpenses}
                  onChange={handleExpensesChange}
                  submitButtonText="Save Diagnostics"
                />
              </TabsContent>

              <TabsContent value="treatment" className="mt-6">
                <DynamicForm
                  schema={treatmentSchema}
                  onSubmit={handleExpensesChange}
                  defaultValues={hospitalExpenses}
                  onChange={handleExpensesChange}
                  submitButtonText="Save Treatment"
                />
              </TabsContent>
            </Tabs>

            {/* Others Section */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-4">Other Charges</h4>
              <DynamicForm
                schema={othersSchema}
                onSubmit={handleExpensesChange}
                defaultValues={hospitalExpenses}
                onChange={handleExpensesChange}
                submitButtonText="Save Other Charges"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            size="lg"
            className="px-8"
          >
            {createMutation.isPending ? 'Creating...' : 'Submit Faculty IPD Claim'}
          </Button>
        </div>
      </div>
    </HelmetWrapper>
  );
};

export default CreateFacultyIPD;
