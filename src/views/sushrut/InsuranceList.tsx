import { useState, useMemo } from 'react';
import {
  Loader2,
  Eye,
  Shield,
  Calendar,
  Building,
  DollarSign,
  User,
  BarChart3,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Activity,
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
import { useInsurances } from '@/hooks/sushrut/insurance.hook';
import type { Insurance } from '@/types';

const InsuranceList = () => {
  const { data: insurances = [], isFetching } = useInsurances();
  const [viewInsurance, setViewInsurance] = useState<Insurance | null>(null);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalPolicies = insurances.length;
    const activePolicies = insurances.filter(i => i.policy_status === 'ACTIVE').length;
    const expiredPolicies = insurances.filter(i => i.policy_status === 'EXPIRED').length;
    const pendingPolicies = insurances.filter(i => i.policy_status === 'PENDING').length;

    const totalCoverage = insurances.reduce((sum, i) => sum + (i.coverage_amount || 0), 0);
    const averageCoverage = totalPolicies > 0 ? Math.round(totalCoverage / totalPolicies) : 0;

    const uniqueCompanies = new Set(insurances.map(i => i.insurance_company)).size;
    const uniqueHolders = new Set(insurances.map(i => i.policy_holder_name)).size;

    // Calculate expiring soon (within 30 days)
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringSoon = insurances.filter(i => {
      if (i.policy_end_date && i.policy_status === 'ACTIVE') {
        const endDate = new Date(i.policy_end_date);
        return endDate >= today && endDate <= thirtyDaysFromNow;
      }
      return false;
    }).length;

    return {
      totalPolicies,
      activePolicies,
      expiredPolicies,
      pendingPolicies,
      totalCoverage,
      averageCoverage,
      uniqueCompanies,
      uniqueHolders,
      expiringSoon,
    };
  }, [insurances]);

  const handleView = (insurance: Insurance) => {
    setViewInsurance(insurance);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-success/10 border-success text-success';
      case 'EXPIRED':
        return 'bg-destructive/10 border-destructive text-destructive';
      case 'PENDING':
        return 'bg-warning/10 border-warning text-warning';
      case 'CANCELLED':
        return 'bg-muted/10 border-muted text-muted-foreground';
      case 'INACTIVE':
        return 'bg-secondary/10 border-secondary text-secondary';
      default:
        return 'bg-muted/10 border-muted text-muted-foreground';
    }
  };

  const isExpiringSoon = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
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
    Status: (value: string) => (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(value)}`}
      >
        {value}
      </span>
    ),
    'Expiry Warning': (value: string, row: Record<string, any>) => {
      if (row._row.policy_status === 'ACTIVE' && isExpiringSoon(value)) {
        return (
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-xs text-warning font-medium">Expiring Soon</span>
          </div>
        );
      }
      return <span className="text-xs text-muted-foreground">-</span>;
    },
  };

  const getTableData = (insurances: Insurance[]) =>
    insurances.map(insurance => ({
      'Policy Number': insurance.policy_number || 'N/A',
      'Holder Name': insurance.policy_holder_name || 'N/A',
      'Session Year': insurance.session_year || 'N/A',
      'Insurance Company': insurance.insurance_company || 'N/A',
      'Coverage Amount': `₹${insurance.coverage_amount?.toLocaleString() || 0}`,
      'Start Date': insurance.policy_start_date
        ? new Date(insurance.policy_start_date).toLocaleDateString()
        : 'N/A',
      'End Date': insurance.policy_end_date
        ? new Date(insurance.policy_end_date).toLocaleDateString()
        : 'N/A',
      Status: insurance.policy_status || 'PENDING',
      'Expiry Warning': insurance.policy_end_date || '',
      View: '',
      _row: { ...insurance },
    }));

  if (isFetching && insurances.length === 0) {
    return (
      <HelmetWrapper
        title="Insurance Policies | Sushrut"
        heading="Insurance Policies"
        subHeading="Comprehensive insurance policy management system"
      >
        <div className="flex justify-center items-center h-96 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading insurance policies...</p>
          </div>
        </div>
      </HelmetWrapper>
    );
  }

  return (
    <HelmetWrapper
      title="Insurance Policies | Sushrut"
      heading="Insurance Policies"
      subHeading="Comprehensive insurance policy management with real-time tracking and analytics"
    >
      <div className="space-y-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card-blue-gradient rounded-2xl p-6 border-2 border-card-blue">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-blue-icon rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-blue font-medium mb-1">Total Policies</p>
                <p className="text-2xl font-bold text-card-blue">{statistics.totalPolicies}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-green-gradient rounded-2xl p-6 border-2 border-card-green">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-green-icon rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-green font-medium mb-1">Active Policies</p>
                <p className="text-2xl font-bold text-card-green">{statistics.activePolicies}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-orange-gradient rounded-2xl p-6 border-2 border-card-orange">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-orange-icon rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-orange font-medium mb-1">Expiring Soon</p>
                <p className="text-2xl font-bold text-card-orange">{statistics.expiringSoon}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-purple-gradient rounded-2xl p-6 border-2 border-card-purple">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-purple-icon rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-purple font-medium mb-1">Total Coverage</p>
                <p className="text-2xl font-bold text-card-purple">
                  ₹{Math.round(statistics.totalCoverage / 1000000)}M
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card-teal-gradient rounded-2xl p-6 border-2 border-card-teal">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-teal-icon rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-teal font-medium mb-1">Avg Coverage</p>
                <p className="text-2xl font-bold text-card-teal">
                  ₹{Math.round(statistics.averageCoverage / 1000)}K
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card-pink-gradient rounded-2xl p-6 border-2 border-card-pink">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-pink-icon rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-pink font-medium mb-1">Companies</p>
                <p className="text-2xl font-bold text-card-pink">{statistics.uniqueCompanies}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-yellow-gradient rounded-2xl p-6 border-2 border-card-yellow">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-yellow-icon rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-yellow font-medium mb-1">Policy Holders</p>
                <p className="text-2xl font-bold text-card-yellow">{statistics.uniqueHolders}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-gray-gradient rounded-2xl p-6 border-2 border-card-gray">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-gray-icon rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-gray font-medium mb-1">Expired</p>
                <p className="text-2xl font-bold text-card-gray">{statistics.expiredPolicies}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Insurance Table */}
        <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              Insurance Policy Management
            </h2>
            <p className="text-muted-foreground mt-2">
              Monitor and manage all insurance policies with comprehensive tracking
            </p>
          </div>

          <div className="p-6">
            <DynamicTable
              tableHeading="Insurance Policies"
              data={getTableData(insurances)}
              customRender={customRender}
              isLoading={isFetching}
            />
          </div>
        </div>
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!viewInsurance} onOpenChange={() => setViewInsurance(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Insurance Policy Details
            </DialogTitle>
          </DialogHeader>

          {viewInsurance && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="policy">Policy Details</TabsTrigger>
                <TabsTrigger value="coverage">Coverage Info</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-foreground">
                          {viewInsurance.policy_holder_name}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(viewInsurance.policy_status)}`}
                        >
                          {viewInsurance.policy_status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Policy Information
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Policy Number:</span>
                                <span className="font-medium">{viewInsurance.policy_number}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Session Year:</span>
                                <span className="font-medium">{viewInsurance.session_year}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Insurance Company:</span>
                                <span className="font-medium">
                                  {viewInsurance.insurance_company}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              Coverage Summary
                            </h4>
                            <div className="text-3xl font-bold text-primary mb-2">
                              ₹{viewInsurance.coverage_amount?.toLocaleString()}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Period: {viewInsurance.period_of_insurance}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Policy Timeline */}
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Policy Timeline
                      </h4>
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Start Date</p>
                          <p className="font-bold text-success">
                            {viewInsurance.policy_start_date
                              ? new Date(viewInsurance.policy_start_date).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </div>
                        <div className="flex-1 h-1 bg-gradient-to-r from-success to-warning mx-4 rounded"></div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">End Date</p>
                          <p className="font-bold text-warning">
                            {viewInsurance.policy_end_date
                              ? new Date(viewInsurance.policy_end_date).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {viewInsurance.policy_end_date &&
                        isExpiringSoon(viewInsurance.policy_end_date) && (
                          <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                            <div className="flex items-center gap-2 text-warning">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                Policy expires within 30 days
                              </span>
                            </div>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="policy" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Medical Claim Policy
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Policy Number:</span>
                          <p className="font-medium">{viewInsurance.medical_claim_policy_no}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Coverage Type:</span>
                          <p className="font-medium">Medical Claims</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Accidental Claim Policy
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Policy Number:</span>
                          <p className="font-medium">{viewInsurance.accidental_claim_policy_no}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Coverage Type:</span>
                          <p className="font-medium">Accidental Claims</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="coverage" className="mt-6">
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Coverage Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Total Coverage</p>
                          <p className="text-2xl font-bold text-primary">
                            ₹{viewInsurance.coverage_amount?.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <Calendar className="w-8 h-8 text-info mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Insurance Period</p>
                          <p className="text-lg font-bold text-info">
                            {viewInsurance.period_of_insurance}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <Building className="w-8 h-8 text-success mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Insurance Provider</p>
                          <p className="text-sm font-bold text-success">
                            {viewInsurance.insurance_company}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-info/20 bg-info/5">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-info mb-2">Coverage Information</h4>
                      <p className="text-sm text-info/80">
                        This insurance policy provides comprehensive coverage including medical and
                        accidental claims. The policy is valid for the specified period and provides
                        financial protection as per the terms and conditions.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </HelmetWrapper>
  );
};

export default InsuranceList;
