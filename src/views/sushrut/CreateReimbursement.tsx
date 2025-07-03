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
import { useCreateStudentReimbursement } from '@/hooks/sushrut/studentReimbursement.hook';
import { type FieldType } from '@/types';
import { Plus, FileText, User, CreditCard, Stethoscope, Receipt } from 'lucide-react';

const studentSchema: FieldType[] = [
  {
    name: 'student_name',
    label: 'Student Name',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Student Information',
  },
  {
    name: 'age',
    label: 'Age',
    type: 'number',
    required: true,
    columns: 1,
    section: 'Student Information',
  },
  {
    name: 'student_id',
    label: 'Student ID',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Student Information',
  },
  {
    name: 'course_program',
    label: 'Course Program',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Student Information',
  },
  {
    name: 'reference_ama',
    label: 'Reference AMA',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Student Information',
  },
  {
    name: 'contact_no',
    label: 'Contact Number',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Student Information',
  },
];

const patientSchema: FieldType[] = [
  {
    name: 'illness_diagnosis',
    label: 'Illness Diagnosis',
    type: 'textarea',
    required: true,
    columns: 1,
    section: 'Medical Information',
  },
  {
    name: 'treatment_from',
    label: 'Treatment From',
    type: 'date',
    required: true,
    columns: 1,
    section: 'Medical Information',
  },
  {
    name: 'treatment_to',
    label: 'Treatment To',
    type: 'date',
    required: true,
    columns: 1,
    section: 'Medical Information',
  },
];

const bankSchema: FieldType[] = [
  {
    name: 'bank_account_no',
    label: 'Bank Account Number',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Bank Details',
  },
  {
    name: 'ifsc_code',
    label: 'IFSC Code',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Bank Details',
  },
  {
    name: 'bank_name',
    label: 'Bank Name',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Bank Details',
  },
  {
    name: 'branch_name',
    label: 'Branch Name',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Bank Details',
  },
];

const reimbursementSchema: FieldType[] = [
  {
    name: 'total_claim_submitted',
    label: 'Total Claim Submitted',
    type: 'number',
    required: true,
    columns: 1,
    section: 'Reimbursement Details',
  },
  {
    name: 'total_enclosures',
    label: 'Total Enclosures',
    type: 'number',
    required: true,
    columns: 1,
    section: 'Reimbursement Details',
  },
  {
    name: 'advance_taken',
    label: 'Advance Taken',
    type: 'number',
    required: false,
    columns: 1,
    section: 'Reimbursement Details',
  },
  {
    name: 'total_amount_recommended',
    label: 'Total Amount Recommended',
    type: 'number',
    required: true,
    columns: 1,
    section: 'Reimbursement Details',
  },
  {
    name: 'total_amount',
    label: 'Total Amount',
    type: 'number',
    required: true,
    columns: 1,
    section: 'Reimbursement Details',
  },
  {
    name: 'register_no',
    label: 'Register Number',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Reimbursement Details',
  },
  {
    name: 'serial_no',
    label: 'Serial Number',
    type: 'text',
    required: true,
    columns: 1,
    section: 'Reimbursement Details',
  },
];

const expenseSchema: FieldType[] = [
  {
    name: 'expense_type',
    label: 'Expense Type',
    type: 'text',
    required: true,
    columns: 1,
  },
  {
    name: 'amount',
    label: 'Amount',
    type: 'number',
    required: true,
    columns: 1,
  },
  {
    name: 'date',
    label: 'Date',
    type: 'date',
    required: true,
    columns: 1,
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    columns: 1,
  },
  {
    name: 'receipt_number',
    label: 'Receipt Number',
    type: 'text',
    required: false,
    columns: 1,
  },
];

const CreateReimbursement = () => {
  const createMutation = useCreateStudentReimbursement();

  const [studentData, setStudentData] = useState<Record<string, any>>({});
  const [patientData, setPatientData] = useState<Record<string, any>>({});
  const [bankData, setBankData] = useState<Record<string, any>>({});
  const [reimbursementData, setReimbursementData] = useState<Record<string, any>>({});
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  const handleAddExpense = (expenseData: Record<string, any>) => {
    setExpenses(prev => [...prev, { ...expenseData, id: Date.now().toString() }]);
    setExpenseDialogOpen(false);
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const handleSubmit = async () => {
    if (
      !studentData.student_name ||
      !patientData.illness_diagnosis ||
      !bankData.bank_account_no ||
      !reimbursementData.total_amount
    ) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    const payload = {
      student: {
        student_name: studentData.student_name,
        age: studentData.age,
        student_id: studentData.student_id,
        course_program: studentData.course_program,
        reference_ama: studentData.reference_ama,
        contact_no: studentData.contact_no,
      },
      patient: {
        illness_diagnosis: patientData.illness_diagnosis,
        treatment_from: patientData.treatment_from,
        treatment_to: patientData.treatment_to,
        ...patientData,
      },
      bank_details: {
        bank_account_no: bankData.bank_account_no,
        ifsc_code: bankData.ifsc_code,
        bank_name: bankData.bank_name,
        branch_name: bankData.branch_name,
      },
      reimbursement: {
        total_claim_submitted: reimbursementData.total_claim_submitted,
        total_enclosures: reimbursementData.total_enclosures,
        advance_taken: reimbursementData.advance_taken,
        total_amount_recommended: reimbursementData.total_amount_recommended,
        total_amount: reimbursementData.total_amount,
        register_no: reimbursementData.register_no,
        serial_no: reimbursementData.serial_no,
      },
      expenses: expenses.map(({ id, ...rest }) => rest),
    };

    await createMutation.mutateAsync(payload);
    toast({ title: 'Student Reimbursement created successfully' });

    // Reset form
    setStudentData({});
    setPatientData({});
    setBankData({});
    setReimbursementData({});
    setExpenses([]);
  };

  return (
    <HelmetWrapper
      title="Create Reimbursement | Sushrut"
      heading="Create Student Reimbursement"
      subHeading="Submit a new medical reimbursement claim with comprehensive details"
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
                <p className="text-sm text-card-blue font-medium">Student Info</p>
                <p className="text-lg font-bold text-card-blue">
                  {Object.keys(studentData).length > 0 ? 'Completed' : 'Pending'}
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
                <p className="text-sm text-card-green font-medium">Medical Info</p>
                <p className="text-lg font-bold text-card-green">
                  {Object.keys(patientData).length > 0 ? 'Completed' : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card-purple-gradient rounded-2xl p-6 border-2 border-card-purple">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-card-purple-icon rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-card-purple font-medium">Bank Details</p>
                <p className="text-lg font-bold text-card-purple">
                  {Object.keys(bankData).length > 0 ? 'Completed' : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card-orange-gradient rounded-2xl p-6 border-2 border-card-orange">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-card-orange-icon rounded-xl flex items-center justify-center">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-card-orange font-medium">Expenses</p>
                <p className="text-lg font-bold text-card-orange">{expenses.length} items</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Student Information */}
          <Card className="border-2 border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Student Information</h3>
              </div>
              <DynamicForm
                schema={studentSchema}
                onSubmit={setStudentData}
                defaultValues={studentData}
                onChange={setStudentData}
                submitButtonText="Save Student Info"
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
                <h3 className="text-lg font-bold text-foreground">Medical Information</h3>
              </div>
              <DynamicForm
                schema={patientSchema}
                onSubmit={setPatientData}
                defaultValues={patientData}
                onChange={setPatientData}
                submitButtonText="Save Medical Info"
              />
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card className="border-2 border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-info rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Bank Details</h3>
              </div>
              <DynamicForm
                schema={bankSchema}
                onSubmit={setBankData}
                defaultValues={bankData}
                onChange={setBankData}
                submitButtonText="Save Bank Details"
              />
            </CardContent>
          </Card>

          {/* Reimbursement Details */}
          <Card className="border-2 border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-warning rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Reimbursement Details</h3>
              </div>
              <DynamicForm
                schema={reimbursementSchema}
                onSubmit={setReimbursementData}
                defaultValues={reimbursementData}
                onChange={setReimbursementData}
                submitButtonText="Save Reimbursement Info"
              />
            </CardContent>
          </Card>
        </div>

        {/* Expenses Section */}
        <Card className="border-2 border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Expenses ({expenses.length})</h3>
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
                    <DialogTitle>Add New Expense</DialogTitle>
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
                    <div>
                      <p className="font-medium">{expense.expense_type}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{expense.amount} - {expense.date}
                      </p>
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
            {createMutation.isPending ? 'Creating...' : 'Submit Reimbursement Claim'}
          </Button>
        </div>
      </div>
    </HelmetWrapper>
  );
};

export default CreateReimbursement;
