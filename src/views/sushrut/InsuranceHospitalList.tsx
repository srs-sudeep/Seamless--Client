import { useState, useMemo } from 'react';
import {
  Loader2,
  Eye,
  Building2,
  Shield,
  DollarSign,
  Phone,
  Mail,
  User,
  BarChart3,
  TrendingUp,
  CheckCircle,
  CreditCard,
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
import { useInsuranceHospitals } from '@/hooks/sushrut/insuranceHospital.hook';
import type { InsuranceHospital } from '@/types';

const InsuranceHospitalList = () => {
  const { data: hospitals = [], isFetching } = useInsuranceHospitals();
  const [viewHospital, setViewHospital] = useState<InsuranceHospital | null>(null);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalHospitals = hospitals.length;
    const activeHospitals = hospitals.filter(h => h.is_active !== false).length;

    const totalMedicalCoverage = hospitals.reduce(
      (sum, h) => sum + (h.medical_claim_sum_insured || 0),
      0
    );
    const totalAccidentalCoverage = hospitals.reduce(
      (sum, h) => sum + (h.accidental_claim_sum_insured || 0),
      0
    );
    const totalBufferAmount = hospitals.reduce((sum, h) => sum + (h.buffer_amount || 0), 0);
    const totalCoverage = hospitals.reduce(
      (sum, h) =>
        sum +
        (h.medical_claim_sum_insured || 0) +
        (h.accidental_claim_sum_insured || 0) +
        (h.accidental_death_or_permanent_disability || 0) +
        (h.loss_of_laptop || 0) +
        (h.damage_or_loss_of_baggage || 0) +
        (h.buffer_amount || 0),
      0
    );

    const uniqueTPAs = new Set(hospitals.map(h => h.tpa)).size;

    const averageCoverage = totalHospitals > 0 ? Math.round(totalCoverage / totalHospitals) : 0;

    return {
      totalHospitals,
      activeHospitals,
      totalMedicalCoverage,
      totalAccidentalCoverage,
      totalBufferAmount,
      totalCoverage,
      uniqueTPAs,
      averageCoverage,
    };
  }, [hospitals]);

  const handleView = (hospital: InsuranceHospital) => {
    setViewHospital(hospital);
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
    Status: (value: boolean | undefined) => {
      const isActive = value !== false;
      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
            isActive
              ? 'bg-success/10 border-success text-success'
              : 'bg-destructive/10 border-destructive text-destructive'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      );
    },
  };

  const getTableData = (hospitals: InsuranceHospital[]) =>
    hospitals.map(hospital => {
      const totalCoverage =
        (hospital.medical_claim_sum_insured || 0) +
        (hospital.accidental_claim_sum_insured || 0) +
        (hospital.accidental_death_or_permanent_disability || 0) +
        (hospital.loss_of_laptop || 0) +
        (hospital.damage_or_loss_of_baggage || 0) +
        (hospital.buffer_amount || 0);

      return {
        'Hospital Name': hospital.hospital_name || 'N/A',
        TPA: hospital.tpa || 'N/A',
        'Authorised Person': hospital.authorised_person || 'N/A',
        Contact: hospital.contact_no || 'N/A',
        'Medical Coverage': `₹${hospital.medical_claim_sum_insured?.toLocaleString() || 0}`,
        'Total Coverage': `₹${totalCoverage.toLocaleString()}`,
        'Ward Entitle': hospital.ward_entitle || 'N/A',
        Status: hospital.is_active,
        View: '',
        _row: { ...hospital },
      };
    });

  if (isFetching && hospitals.length === 0) {
    return (
      <HelmetWrapper
        title="Insurance Hospitals | Sushrut"
        heading="Insurance Hospitals"
        subHeading="Network of insurance hospitals with comprehensive coverage"
      >
        <div className="flex justify-center items-center h-96 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading insurance hospital data...</p>
          </div>
        </div>
      </HelmetWrapper>
    );
  }

  return (
    <HelmetWrapper
      title="Insurance Hospitals | Sushrut"
      heading="Insurance Hospitals"
      subHeading="Comprehensive network of insurance hospitals with detailed coverage information"
    >
      <div className="space-y-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card-blue-gradient rounded-2xl p-6 border-2 border-card-blue">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-blue-icon rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-blue font-medium mb-1">Total Hospitals</p>
                <p className="text-2xl font-bold text-card-blue">{statistics.totalHospitals}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-green-gradient rounded-2xl p-6 border-2 border-card-green">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-green-icon rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-green font-medium mb-1">Active Hospitals</p>
                <p className="text-2xl font-bold text-card-green">{statistics.activeHospitals}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-purple-gradient rounded-2xl p-6 border-2 border-card-purple">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-purple-icon rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-purple font-medium mb-1">Total Coverage</p>
                <p className="text-2xl font-bold text-card-purple">
                  ₹{Math.round(statistics.totalCoverage / 1000000)}M
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card-orange-gradient rounded-2xl p-6 border-2 border-card-orange">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-orange-icon rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-orange font-medium mb-1">Avg Coverage</p>
                <p className="text-2xl font-bold text-card-orange">
                  ₹{Math.round(statistics.averageCoverage / 1000)}K
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card-teal-gradient rounded-2xl p-6 border-2 border-card-teal">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-teal-icon rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-teal font-medium mb-1">Medical Coverage</p>
                <p className="text-2xl font-bold text-card-teal">
                  ₹{Math.round(statistics.totalMedicalCoverage / 1000000)}M
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card-pink-gradient rounded-2xl p-6 border-2 border-card-pink">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-pink-icon rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-pink font-medium mb-1">Buffer Amount</p>
                <p className="text-2xl font-bold text-card-pink">
                  ₹{Math.round(statistics.totalBufferAmount / 1000000)}M
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card-yellow-gradient rounded-2xl p-6 border-2 border-card-yellow">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-yellow-icon rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-yellow font-medium mb-1">Unique TPAs</p>
                <p className="text-2xl font-bold text-card-yellow">{statistics.uniqueTPAs}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hospitals Table */}
        <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              Insurance Hospital Network
            </h2>
            <p className="text-muted-foreground mt-2">
              Manage insurance hospitals with comprehensive coverage details
            </p>
          </div>

          <div className="p-6">
            <DynamicTable
              tableHeading="Insurance Hospitals"
              data={getTableData(hospitals)}
              customRender={customRender}
              isLoading={isFetching}
            />
          </div>
        </div>
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!viewHospital} onOpenChange={() => setViewHospital(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="w-6 h-6 text-primary" />
              Insurance Hospital Details
            </DialogTitle>
          </DialogHeader>

          {viewHospital && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="contact">Contact & Admin</TabsTrigger>
                <TabsTrigger value="coverage">Coverage Details</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-foreground mb-4">
                        {viewHospital.hospital_name}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Insurance Summary
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">TPA:</span>
                                <span className="font-medium">{viewHospital.tpa}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Ward Entitlement:</span>
                                <span className="font-medium">{viewHospital.ward_entitle}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              Total Coverage
                            </h4>
                            <div className="text-3xl font-bold text-primary">
                              ₹
                              {(
                                (viewHospital.medical_claim_sum_insured || 0) +
                                (viewHospital.accidental_claim_sum_insured || 0) +
                                (viewHospital.accidental_death_or_permanent_disability || 0) +
                                (viewHospital.loss_of_laptop || 0) +
                                (viewHospital.damage_or_loss_of_baggage || 0) +
                                (viewHospital.buffer_amount || 0)
                              ).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Authorised Person
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name:</span>
                          <p className="font-medium">{viewHospital.authorised_person}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Contact Information
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{viewHospital.contact_no}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{viewHospital.email}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="coverage" className="mt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        label: 'Medical Claim',
                        amount: viewHospital.medical_claim_sum_insured,
                        icon: Shield,
                        color: 'text-blue-600',
                      },
                      {
                        label: 'Accidental Claim',
                        amount: viewHospital.accidental_claim_sum_insured,
                        icon: Shield,
                        color: 'text-red-600',
                      },
                      {
                        label: 'Death/Disability',
                        amount: viewHospital.accidental_death_or_permanent_disability,
                        icon: Shield,
                        color: 'text-purple-600',
                      },
                      {
                        label: 'Laptop Loss',
                        amount: viewHospital.loss_of_laptop,
                        icon: DollarSign,
                        color: 'text-green-600',
                      },
                      {
                        label: 'Baggage Loss',
                        amount: viewHospital.damage_or_loss_of_baggage,
                        icon: DollarSign,
                        color: 'text-orange-600',
                      },
                      {
                        label: 'Buffer Amount',
                        amount: viewHospital.buffer_amount,
                        icon: CreditCard,
                        color: 'text-teal-600',
                      },
                    ].map((item, index) => (
                      <Card key={index} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <item.icon className={`w-5 h-5 ${item.color}`} />
                            <span className="text-lg font-bold">
                              ₹{item.amount?.toLocaleString() || 0}
                            </span>
                          </div>
                          <h5 className="font-medium text-sm">{item.label}</h5>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card className="border border-info/20 bg-info/5">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-info mb-2">Coverage Information</h4>
                      <p className="text-sm text-info/80">
                        This insurance hospital provides comprehensive coverage including medical
                        claims, accidental coverage, and additional benefits for laptop and baggage
                        protection. The buffer amount provides extra financial protection beyond
                        standard coverage limits.
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

export default InsuranceHospitalList;
