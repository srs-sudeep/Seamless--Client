import { useState } from 'react';
import {
  DynamicForm,
  HelmetWrapper,
  toast,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components';
import { useCreateFacultyOPDClaim } from '@/hooks/sushrut/facultyOPD.hook';
import { type FieldType } from '@/types';
import {
  User,
  Stethoscope,
  FileText,
  Calculator,
  Plus,
  Receipt,
  Building2,
  Mail,
  Phone,
} from 'lucide-react';

const claimantSchema: FieldType[] = [
  {
    name: 'claimant_name',
    label: 'Claimant Name',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Claimant Information',
  },
  {
    name: 'employee_code',
    label: 'Employee Code',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Claimant Information',
  },
  {
    name: 'designation',
    label: 'Designation',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Claimant Information',
  },
  {
    name: 'telephone',
    label: 'Telephone',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Claimant Information',
  },
  {
    name: 'department',
    label: 'Department',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Claimant Information',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    columns: 1,
    section: 'Claimant Information',
  },
  {
    name: 'ward_entitlement',
    label: 'Ward Entitlement',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Claimant Information',
  },
  {
    name: 'pay_band_grade',
    label: 'Pay Band Grade',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Claimant Information',
  },
];

const patientSchema: FieldType[] = [
  {
    name: 'patient_name',
    label: 'Patient Name',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Patient Information',
  },
  {
    name: 'patient_id',
    label: 'Patient ID',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Patient Information',
  },
  {
    name: 'relationship_to_claimant',
    label: 'Relationship to Claimant',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Patient Information',
  },
  {
    name: 'illness_nature',
    label: 'Nature of Illness',
    type: 'textarea',
    required: true,
    columns: 1,
    section: 'Patient Information',
  },
  {
    name: 'referring_ama',
    label: 'Referring AMA',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Patient Information',
  },
  {
    name: 'treated_hospital',
    label: 'Treated Hospital',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Patient Information',
  },
];

const facultyOPDSchema: FieldType[] = [
  {
    name: 'total_claim_submitted',
    label: 'Total Claim Submitted',
    type: 'number',
    required: true,
    columns: 1,
    section: 'OPD Details',
  },
  {
    name: 'total_enclosures',
    label: 'Total Enclosures',
    type: 'number',
    required: true,
    columns: 1,
    section: 'OPD Details',
  },
  {
    name: 'advance_taken',
    label: 'Advance Taken',
    type: 'number',
    required: false,
    columns: 1,
    section: 'OPD Details',
  },
  {
    name: 'total_amount_recommended',
    label: 'Total Amount Recommended',
    type: 'number',
    required: true,
    columns: 1,
    section: 'OPD Details',
  },
  {
    name: 'declaration_date',
    label: 'Declaration Date',
    type: 'date',
    required: true,
    columns: 1,
    section: 'OPD Details',
  },
];

const expenseSchema: FieldType[] = [
  {
    name: 'particular_name',
    label: 'Particular Name',
    type: 'text',
    required: true,
    columns: 1,
  },
  {
    name: 'particular_enum',
    label: 'Particular Enum',
    type: 'text',
    required: true,
    columns: 1,
  },
  {
    name: 'claimed_amount',
    label: 'Claimed Amount',
    type: 'number',
    required: true,
    columns: 1,
  },
  {
    name: 'recommended_amount',
    label: 'Recommended Amount',
    type: 'number',
    required: true,
    columns: 1,
  },
  {
    name: 'is_custom_particular',
    label: 'Is Custom Particular',
    type: 'text',
    required: false,
    columns: 1,
  },
];

const CreateFacultyOPD = () => {
  const createMutation = useCreateFacultyOPDClaim();

  const [claimantData, setClaimantData] = useState<Record<string, any>>({});
  const [patientData, setPatientData] = useState<Record<string, any>>({});
  const [facultyOPDData, setFacultyOPDData] = useState<Record<string, any>>({});
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  const handleAddExpense = (expenseData: Record<string, any>) => {
    setExpenses(prev => [...prev, { ...expenseData, id: Date.now().toString() }]);
    setExpenseDialogOpen(false);
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const calculateTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  };

  const handleSubmit = async () => {
    if (
      !claimantData.claimant_name ||
      !patientData.patient_name ||
      !facultyOPDData.total_claim_submitted
    ) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    // Convert number fields to numbers
    const facultyOPDDataNumbered = {
      ...facultyOPDData,
      total_claim_submitted: Number(facultyOPDData.total_claim_submitted),
      total_enclosures: Number(facultyOPDData.total_enclosures),
      advance_taken:
        facultyOPDData.advance_taken !== undefined && facultyOPDData.advance_taken !== ''
          ? Number(facultyOPDData.advance_taken)
          : undefined,
      total_amount_recommended: Number(facultyOPDData.total_amount_recommended),
    };

    const expensesNumbered = expenses.map(({ recommended_amount, claimed_amount, ...rest }) => ({
      ...rest,
      recommended_amount: Number(recommended_amount),
      claimed_amount: Number(claimed_amount),
    }));

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
        patient_id: patientData.patient_id,
        relationship_to_claimant: patientData.relationship_to_claimant,
        illness_nature: patientData.illness_nature,
        referring_ama: patientData.referring_ama,
        treated_hospital: patientData.treated_hospital,
      },
      faculty_opd: facultyOPDDataNumbered,
      hospital_expenses: expensesNumbered,
    };

    await createMutation.mutateAsync(payload);
    toast({ title: 'Faculty OPD claim created successfully' });

    // Reset form
    setClaimantData({});
    setPatientData({});
    setFacultyOPDData({});
    setExpenses([]);
  };

  return (
    <HelmetWrapper
      title="Create Faculty OPD Claim | Sushrut"
      heading="Create Faculty OPD Claim"
      subHeading="Submit a new out-patient department medical claim for faculty members"
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
                <p className="text-sm text-card-purple font-medium">OPD Details</p>
                <p className="text-lg font-bold text-card-purple">
                  {Object.keys(facultyOPDData).length > 0 ? 'Completed' : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card-orange-gradient rounded-2xl p-6 border-2 border-card-orange">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-card-orange-icon rounded-xl flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-card-orange font-medium">Total Expenses</p>
                <p className="text-lg font-bold text-card-orange">
                  ₹{calculateTotalExpenses().toLocaleString()}
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
                  <User className="w-5 h-5 text-primary-foreground" />
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

        {/* OPD Details */}
        <Card className="border-2 border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-info rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Faculty OPD Details</h3>
            </div>
            <DynamicForm
              schema={facultyOPDSchema}
              onSubmit={setFacultyOPDData}
              defaultValues={facultyOPDData}
              onChange={setFacultyOPDData}
              submitButtonText="Save OPD Details"
            />
          </CardContent>
        </Card>

        {/* Hospital Expenses Section */}
        <Card className="border-2 border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Hospital Expenses ({expenses.length})
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Total: ₹{calculateTotalExpenses().toLocaleString()}
                  </p>
                </div>
              </div>

              <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Expense
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Hospital Expense</DialogTitle>
                  </DialogHeader>
                  <DynamicForm
                    schema={expenseSchema}
                    onSubmit={handleAddExpense}
                    submitButtonText="Add Expense"
                  />
                </DialogContent>
              </Dialog>
            </div>

            {expenses.length > 0 && (
              <div className="space-y-3">
                {expenses.map((expense, index) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{expense.expense_type}</p>
                          <p className="text-sm text-muted-foreground">{expense.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">₹{expense.amount}</p>
                          <p className="text-sm text-muted-foreground">{expense.date}</p>
                        </div>
                      </div>
                      {expense.hospital_name && (
                        <p className="text-sm text-muted-foreground mt-2">
                          <Building2 className="w-3 h-3 inline mr-1" />
                          {expense.hospital_name}
                        </p>
                      )}
                      {expense.receipt_number && (
                        <p className="text-sm text-muted-foreground">
                          Receipt: {expense.receipt_number}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveExpense(expense.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {expenses.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No expenses added yet</p>
                <p className="text-sm">Click "Add Expense" to start adding hospital expenses</p>
              </div>
            )}
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
            {createMutation.isPending ? 'Creating...' : 'Submit Faculty OPD Claim'}
          </Button>
        </div>
      </div>
    </HelmetWrapper>
  );
};

export default CreateFacultyOPD;
