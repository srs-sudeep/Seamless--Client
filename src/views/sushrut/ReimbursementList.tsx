import { useState, useMemo } from 'react';
import {
  Loader2,
  Eye,
  Trash2,
  FileText,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingUp,
  Target,
  Plus,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import {
  DynamicTable,
  Button,
  HelmetWrapper,
  toast,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Card,
  CardContent,
} from '@/components';
import {
  useStudentReimbursements,
  useDeleteStudentReimbursement,
} from '@/hooks/sushrut/studentReimbursement.hook';
import type { StudentReimbursement } from '@/types';

const ReimbursementList = () => {
  const { data: reimbursements = [], isFetching } = useStudentReimbursements();
  const deleteMutation = useDeleteStudentReimbursement();

  const [viewReimbursement, setViewReimbursement] = useState<StudentReimbursement | null>(null);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalClaims = reimbursements.length;
    const totalAmount = reimbursements.reduce(
      (sum, r) => sum + (r.reimbursement?.total_amount || 0),
      0
    );

    // Get unique students
    const uniqueStudents = new Set(reimbursements.map(r => r.student?.student_id)).size;

    return {
      totalClaims,
      totalAmount,
      uniqueStudents,
    };
  }, [reimbursements]);

  const handleView = (reimbursement: StudentReimbursement) => {
    setViewReimbursement(reimbursement);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    toast({ title: 'Reimbursement deleted successfully' });
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
    Delete: (_: any, row: Record<string, any>) => (
      <Button
        size="icon"
        variant="destructive"
        onClick={e => {
          e.stopPropagation();
          handleDelete(row._row.id);
        }}
        disabled={deleteMutation.isPending}
      >
        {deleteMutation.isPending ? (
          <Loader2 className="animate-spin w-4 h-4" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </Button>
    ),
    Status: (value: string) => {
      const statusConfig = {
        pending: { color: 'bg-warning/10 border-warning text-warning', label: 'Pending' },
        approved: { color: 'bg-success/10 border-success text-success', label: 'Approved' },
        rejected: {
          color: 'bg-destructive/10 border-destructive text-destructive',
          label: 'Rejected',
        },
        processing: { color: 'bg-info/10 border-info text-info', label: 'Processing' },
      };
      const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.pending;

      return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
          {config.label}
        </span>
      );
    },
  };

  const getTableData = (reimbursements: StudentReimbursement[]) =>
    reimbursements.map(reimbursement => ({
      'Student Name': reimbursement.student?.student_name || 'N/A',
      'Student ID': reimbursement.student?.student_id || 'N/A',
      'Total Amount': `₹${reimbursement.reimbursement?.total_amount || 0}`,
      Diagnosis: reimbursement.patient?.illness_diagnosis || 'N/A',
      Created: reimbursement.created_at
        ? new Date(reimbursement.created_at).toLocaleDateString()
        : 'N/A',
      View: '',
      Approve: '',
      Reject: '',
      Delete: '',
      _row: { ...reimbursement },
    }));

  if (isFetching && reimbursements.length === 0) {
    return (
      <HelmetWrapper
        title="Student Reimbursements | Sushrut"
        heading="Student Reimbursements"
        subHeading="Medical reimbursement claims management system"
      >
        <div className="flex justify-center items-center h-96 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading reimbursement data...</p>
          </div>
        </div>
      </HelmetWrapper>
    );
  }

  return (
    <HelmetWrapper
      title="Student Reimbursements | Sushrut"
      heading="Student Reimbursements"
      subHeading="Comprehensive medical reimbursement claims management with real-time analytics"
    >
      <div className="space-y-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card-blue-gradient rounded-2xl p-6 border-2 border-card-blue">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-blue-icon rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-blue font-medium mb-1">Total Claims</p>
                <p className="text-2xl font-bold text-card-blue">{statistics.totalClaims}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-orange-gradient rounded-2xl p-6 border-2 border-card-orange">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-orange-icon rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-card-green-gradient rounded-2xl p-6 border-2 border-card-green">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-green-icon rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-card-purple-gradient rounded-2xl p-6 border-2 border-card-purple">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-purple-icon rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
        {/* Enhanced Reimbursements Table */}
        <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              Reimbursement Claims
            </h2>
            <p className="text-muted-foreground mt-2">
              Comprehensive management of student medical reimbursement claims with approval
              workflow
            </p>
          </div>

          <div className="p-6">
            <DynamicTable
              tableHeading="Student Reimbursements"
              data={getTableData(reimbursements)}
              customRender={customRender}
              isLoading={isFetching}
              headerActions={
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Claim
                </Button>
              }
            />
          </div>
        </div>
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!viewReimbursement} onOpenChange={() => setViewReimbursement(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Reimbursement Details
            </DialogTitle>
          </DialogHeader>

          {viewReimbursement && (
            <div className="space-y-6">
              {/* Student Info */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Student Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Name:</strong> {viewReimbursement.student?.student_name}
                    </div>
                    <div>
                      <strong>ID:</strong> {viewReimbursement.student?.student_id}
                    </div>
                    <div>
                      <strong>Age:</strong> {viewReimbursement.student?.age}
                    </div>
                    <div>
                      <strong>Course:</strong> {viewReimbursement.student?.course_program}
                    </div>
                    <div>
                      <strong>Contact:</strong> {viewReimbursement.student?.contact_no}
                    </div>
                    <div>
                      <strong>Reference AMA:</strong> {viewReimbursement.student?.reference_ama}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medical Info */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Medical Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div>
                      <strong>Diagnosis:</strong> {viewReimbursement.patient?.illness_diagnosis}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong>Treatment From:</strong> {viewReimbursement.patient?.treatment_from}
                      </div>
                      <div>
                        <strong>Treatment To:</strong> {viewReimbursement.patient?.treatment_to}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bank Details */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Bank Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Account No:</strong> {viewReimbursement.bank_details?.bank_account_no}
                    </div>
                    <div>
                      <strong>IFSC:</strong> {viewReimbursement.bank_details?.ifsc_code}
                    </div>
                    <div>
                      <strong>Bank:</strong> {viewReimbursement.bank_details?.bank_name}
                    </div>
                    <div>
                      <strong>Branch:</strong> {viewReimbursement.bank_details?.branch_name}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reimbursement Details */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Reimbursement Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Total Claim:</strong> ₹
                      {viewReimbursement.reimbursement?.total_claim_submitted}
                    </div>
                    <div>
                      <strong>Total Amount:</strong> ₹
                      {viewReimbursement.reimbursement?.total_amount}
                    </div>
                    <div>
                      <strong>Recommended:</strong> ₹
                      {viewReimbursement.reimbursement?.total_amount_recommended}
                    </div>
                    <div>
                      <strong>Advance Taken:</strong> ₹
                      {viewReimbursement.reimbursement?.advance_taken}
                    </div>
                    <div>
                      <strong>Enclosures:</strong>{' '}
                      {viewReimbursement.reimbursement?.total_enclosures}
                    </div>
                    <div>
                      <strong>Register No:</strong> {viewReimbursement.reimbursement?.register_no}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Expenses */}
              {viewReimbursement.expenses && viewReimbursement.expenses.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">
                      Expenses ({viewReimbursement.expenses.length})
                    </h3>
                    <div className="space-y-2">
                      {viewReimbursement.expenses.map((expense, index) => (
                        <div key={index} className="p-3 bg-muted rounded border">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{expense.expense_type}</p>
                              <p className="text-sm text-muted-foreground">{expense.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">₹{expense.amount}</p>
                              <p className="text-sm text-muted-foreground">{expense.date}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </HelmetWrapper>
  );
};

export default ReimbursementList;
