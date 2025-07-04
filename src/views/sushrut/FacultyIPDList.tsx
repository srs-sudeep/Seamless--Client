import { useState } from 'react';
import { Loader2, Eye, FileText, BarChart3 } from 'lucide-react';
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
import { useFacultyIPDClaims } from '@/hooks/sushrut/facultyIPD.hook';
import type { FacultyIPDClaim } from '@/types';

const FacultyIPDList = () => {
  const { data: claims = [], isFetching } = useFacultyIPDClaims();
  const [viewClaim, setViewClaim] = useState<FacultyIPDClaim | null>(null);

  const handleView = (claim: FacultyIPDClaim) => {
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

  const getTableData = (claims: FacultyIPDClaim[]) =>
    claims.map(claim => ({
      'Claimant Name': claim.claimant?.claimant_name || 'N/A',
      'Employee Code': claim.claimant?.employee_code || 'N/A',
      Department: claim.claimant?.department || 'N/A',
      'Patient Name': claim.patient?.patient_name || 'N/A',
      'Claimed Amount': `₹${claim.hospital_expenses?.total_claimed_amount?.toLocaleString() || 0}`,
      'Recommended Amount': `₹${claim.hospital_expenses?.total_recommended_amount?.toLocaleString() || 0}`,
      View: '',
      _row: { ...claim },
    }));

  if (isFetching && claims.length === 0) {
    return (
      <HelmetWrapper
        title="Faculty IPD Claims | Sushrut"
        heading="Faculty IPD Claims"
        subHeading="In-patient department medical claims management for faculty members"
      >
        <div className="flex justify-center items-center h-96 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading IPD claims data...</p>
          </div>
        </div>
      </HelmetWrapper>
    );
  }

  return (
    <HelmetWrapper
      title="Faculty IPD Claims | Sushrut"
      heading="Faculty IPD Claims"
      subHeading="Comprehensive in-patient department medical claims management with real-time analytics"
    >
      <div className="space-y-8">
        {/* Claims Table */}
        <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              Faculty IPD Claims
            </h2>
            <p className="text-muted-foreground mt-2">
              View and manage faculty in-patient department medical claims
            </p>
          </div>

          <div className="p-6">
            <DynamicTable
              tableHeading="Faculty IPD Claims"
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
              Faculty IPD Claim Details
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
                      <h3 className="font-semibold mb-3">Claim Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Claimed:</span>
                          <span className="font-bold">
                            ₹{viewClaim.hospital_expenses?.total_claimed_amount?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Recommended:</span>
                          <span className="font-bold">
                            ₹
                            {viewClaim.hospital_expenses?.total_recommended_amount?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3">IPD Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Claim Submitted:</span>
                          <span className="font-bold">
                            ₹{viewClaim.faculty_ipd?.total_claim_submitted?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Enclosures:</span>
                          <span className="font-bold">
                            {viewClaim.faculty_ipd?.total_enclosures}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Advance Taken:</span>
                          <span className="font-bold">
                            ₹{viewClaim.faculty_ipd?.advance_taken?.toLocaleString()}
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
                    <h3 className="font-semibold mb-3">Claimant Information</h3>
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
                    <h3 className="font-semibold mb-3">Patient Information</h3>
                    <div className="grid grid-cols-1 gap-4 text-sm">
                      <div>
                        <strong>Patient Name:</strong> {viewClaim.patient?.patient_name}
                      </div>
                      <div>
                        <strong>Relationship:</strong> {viewClaim.patient?.relationship_to_claimant}
                      </div>
                      <div>
                        <strong>Illness Description:</strong>{' '}
                        {viewClaim.patient?.illness_description}
                      </div>
                      <div>
                        <strong>Illness Period:</strong> {viewClaim.patient?.illness_period}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <strong>Referring AMA:</strong> {viewClaim.patient?.referring_ama}
                        </div>
                        <div>
                          <strong>Referring Date:</strong> {viewClaim.patient?.referring_date}
                        </div>
                      </div>
                      <div>
                        <strong>Referred Hospital:</strong> {viewClaim.patient?.referred_hospital}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="expenses" className="mt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-3">Expense Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Claimed:</span>
                            <span className="font-bold text-destructive">
                              ₹{viewClaim.hospital_expenses?.total_claimed_amount?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Recommended:</span>
                            <span className="font-bold text-success">
                              ₹
                              {viewClaim.hospital_expenses?.total_recommended_amount?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-muted-foreground font-medium">Difference:</span>
                            <span className="font-bold">
                              ₹
                              {(
                                (viewClaim.hospital_expenses?.total_claimed_amount || 0) -
                                (viewClaim.hospital_expenses?.total_recommended_amount || 0)
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-3">Top Expense Categories</h4>
                        <div className="space-y-2 text-sm">
                          {viewClaim.hospital_expenses &&
                            Object.entries(viewClaim.hospital_expenses)
                              .filter(
                                ([key, value]) => key.includes('_claimed') && Number(value) > 0
                              )
                              .sort(([, a], [, b]) => Number(b) - Number(a))
                              .slice(0, 5)
                              .map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-muted-foreground capitalize">
                                    {key.replace('_claimed', '').replace('_', ' ')}:
                                  </span>
                                  <span className="font-medium">
                                    ₹{Number(value).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </HelmetWrapper>
  );
};

export default FacultyIPDList;
