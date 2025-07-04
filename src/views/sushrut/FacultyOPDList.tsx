import { useState, useMemo } from 'react';
import {
  Loader2,
  Eye,
  FileText,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  BarChart3,
  Building2,
  TrendingUp,
  AlertTriangle,
  Receipt,
  Stethoscope,
  User,
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
} from '@/components';
import { useFacultyOPDClaims } from '@/hooks/sushrut/facultyOPD.hook';
import type { FacultyOPDClaim } from '@/types';

const FacultyOPDList = () => {
  const { data: claims = [], isFetching } = useFacultyOPDClaims();
  const [viewClaim, setViewClaim] = useState<FacultyOPDClaim | null>(null);

  const handleView = (claim: FacultyOPDClaim) => {
    setViewClaim(claim);
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
    Status: (value: string) => {
      const statusConfig = {
        pending: { color: 'bg-warning/10 border-warning text-warning', label: 'Pending' },
        approved: { color: 'bg-success/10 border-success text-success', label: 'Approved' },
        rejected: {
          color: 'bg-destructive/10 border-destructive text-destructive',
          label: 'Rejected',
        },
        processing: { color: 'bg-info/10 border-info text-info', label: 'Processing' },
        under_review: {
          color:
            'bg-purple-100 border-purple-400 text-purple-700 dark:bg-purple-900/20 dark:border-purple-600 dark:text-purple-300',
          label: 'Under Review',
        },
      };
      const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.pending;

      return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
          {config.label}
        </span>
      );
    },
  };

  const getTableData = (claims: FacultyOPDClaim[]) =>
    claims.map(claim => ({
      'Claimant Name': claim.claimant?.claimant_name || 'N/A',
      'Employee Code': claim.claimant?.employee_code || 'N/A',
      Department: claim.claimant?.department || 'N/A',
      'Patient Name': claim.patient?.patient_name || 'N/A',
      'Patient ID': claim.patient?.patient_id || 'N/A',
      'Claimed Amount': `₹${claim.faculty_opd?.total_claim_submitted?.toLocaleString() || 0}`,
      'Recommended Amount': `₹${claim.faculty_opd?.total_amount_recommended?.toLocaleString() || 0}`,
      'Expenses Count': claim.hospital_expenses?.length || 0,
      View: '',
      _row: { ...claim },
    }));

  if (isFetching && claims.length === 0) {
    return (
      <HelmetWrapper
        title="Faculty OPD Claims | Sushrut"
        heading="Faculty OPD Claims"
        subHeading="Out-patient department medical claims management for faculty members"
      >
        <div className="flex justify-center items-center h-96 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading OPD claims data...</p>
          </div>
        </div>
      </HelmetWrapper>
    );
  }

  return (
    <HelmetWrapper
      title="Faculty OPD Claims | Sushrut"
      heading="Faculty OPD Claims"
      subHeading="Comprehensive out-patient department medical claims management with real-time analytics"
    >
      <div className="space-y-8">
        {/* Claims Table */}
        <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              Faculty OPD Claims
            </h2>
            <p className="text-muted-foreground mt-2">
              View and manage faculty out-patient department medical claims
            </p>
          </div>

          <div className="p-6">
            <DynamicTable
              tableHeading="Faculty OPD Claims"
              data={getTableData(claims)}
              customRender={customRender}
              isLoading={isFetching}
            />
          </div>
        </div>
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!viewClaim} onOpenChange={() => setViewClaim(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Faculty OPD Claim Details
            </DialogTitle>
          </DialogHeader>

          {viewClaim && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="claimant">Claimant</TabsTrigger>
                <TabsTrigger value="patient">Patient</TabsTrigger>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Claim Summary
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Claimed:</span>
                          <span className="font-bold">
                            ₹{viewClaim.faculty_opd?.total_claim_submitted?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Recommended:</span>
                          <span className="font-bold">
                            ₹{viewClaim.faculty_opd?.total_amount_recommended?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Expenses:</span>
                          <span className="font-bold">
                            ₹
                            {viewClaim.hospital_expenses
                              ?.reduce((sum, exp) => sum + (exp.amount || 0), 0)
                              .toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        OPD Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Enclosures:</span>
                          <span className="font-bold">
                            {viewClaim.faculty_opd?.total_enclosures}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Advance Taken:</span>
                          <span className="font-bold">
                            ₹{viewClaim.faculty_opd?.advance_taken?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Declaration Date:</span>
                          <span className="font-bold">
                            {viewClaim.faculty_opd?.declaration_date}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Hospital Expenses:</span>
                          <span className="font-bold">
                            {viewClaim.hospital_expenses?.length || 0} items
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="claimant" className="mt-6">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Claimant Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Name:</strong> {viewClaim.claimant?.claimant_name}
                      </div>
                      <div>
                        <strong>Employee Code:</strong> {viewClaim.claimant?.employee_code}
                      </div>
                      <div>
                        <strong>Designation:</strong> {viewClaim.claimant?.designation}
                      </div>
                      <div>
                        <strong>Department:</strong> {viewClaim.claimant?.department}
                      </div>
                      <div>
                        <strong>Email:</strong> {viewClaim.claimant?.email}
                      </div>
                      <div>
                        <strong>Telephone:</strong> {viewClaim.claimant?.telephone}
                      </div>
                      <div>
                        <strong>Ward Entitlement:</strong> {viewClaim.claimant?.ward_entitlement}
                      </div>
                      <div>
                        <strong>Pay Band Grade:</strong> {viewClaim.claimant?.pay_band_grade}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="patient" className="mt-6">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" />
                      Patient Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <strong>Patient Name:</strong> {viewClaim.patient?.patient_name}
                        </div>
                        <div>
                          <strong>Patient ID:</strong> {viewClaim.patient?.patient_id}
                        </div>
                      </div>
                      <div>
                        <strong>Relationship:</strong> {viewClaim.patient?.relationship_to_claimant}
                      </div>
                      <div>
                        <strong>Nature of Illness:</strong> {viewClaim.patient?.illness_nature}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <strong>Referring AMA:</strong> {viewClaim.patient?.referring_ama}
                        </div>
                        <div>
                          <strong>Treated Hospital:</strong> {viewClaim.patient?.treated_hospital}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="expenses" className="mt-6">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Receipt className="w-4 h-4" />
                        Expense Summary
                      </h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-3 bg-muted rounded">
                          <p className="text-muted-foreground">Total Expenses</p>
                          <p className="font-bold text-lg">
                            ₹
                            {viewClaim.hospital_expenses
                              ?.reduce((sum, exp) => sum + (exp.amount || 0), 0)
                              .toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-muted rounded">
                          <p className="text-muted-foreground">Number of Items</p>
                          <p className="font-bold text-lg">
                            {viewClaim.hospital_expenses?.length || 0}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-muted rounded">
                          <p className="text-muted-foreground">Average Amount</p>
                          <p className="font-bold text-lg">
                            ₹
                            {viewClaim.hospital_expenses?.length
                              ? Math.round(
                                  viewClaim.hospital_expenses.reduce(
                                    (sum, exp) => sum + (exp.amount || 0),
                                    0
                                  ) / viewClaim.hospital_expenses.length
                                ).toLocaleString()
                              : 0}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {viewClaim.hospital_expenses && viewClaim.hospital_expenses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {viewClaim.hospital_expenses.map((expense, index) => (
                        <Card key={index} className="border">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <h5 className="font-medium">{expense.expense_type}</h5>
                                <span className="font-bold text-lg">
                                  ₹{expense.amount?.toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{expense.description}</p>
                              <div className="space-y-1 text-xs text-muted-foreground">
                                <p>
                                  <strong>Date:</strong> {expense.date}
                                </p>
                                {expense.hospital_name && (
                                  <p>
                                    <strong>Hospital:</strong> {expense.hospital_name}
                                  </p>
                                )}
                                {expense.receipt_number && (
                                  <p>
                                    <strong>Receipt:</strong> {expense.receipt_number}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-muted-foreground">
                          No hospital expenses recorded for this claim
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </HelmetWrapper>
  );
};

export default FacultyOPDList;
