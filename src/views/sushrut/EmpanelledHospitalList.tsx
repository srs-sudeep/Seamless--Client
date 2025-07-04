import { useState } from 'react';
import { Loader2, Eye, Hospital, MapPin, Building2, BarChart3 } from 'lucide-react';
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
} from '@/components';
import { useEmpanelledHospitals } from '@/hooks/sushrut/empanelledHospital.hook';
import type { EmpanelledHospital } from '@/types';

const EmpanelledHospitalList = () => {
  const { data: hospitals = [], isFetching } = useEmpanelledHospitals();
  const [viewHospital, setViewHospital] = useState<EmpanelledHospital | null>(null);

  const handleView = (hospital: EmpanelledHospital) => {
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

  const getTableData = (hospitals: EmpanelledHospital[]) =>
    hospitals.map(hospital => {
      // Extract city from address
      const addressParts = hospital.address?.split(',') || [];
      const city = addressParts[addressParts.length - 2]?.trim() || 'N/A';

      return {
        'Hospital Name': hospital.hospital_name || 'N/A',
        City: city,
        'Full Address': hospital.address || 'N/A',
        View: '',
        _row: { ...hospital },
      };
    });

  if (isFetching && hospitals.length === 0) {
    return (
      <HelmetWrapper
        title="Empanelled Hospitals | Sushrut"
        heading="Empanelled Hospitals"
        subHeading="Network of hospitals authorized for medical claims"
      >
        <div className="flex justify-center items-center h-96 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading hospital data...</p>
          </div>
        </div>
      </HelmetWrapper>
    );
  }

  return (
    <HelmetWrapper
      title="Empanelled Hospitals | Sushrut"
      heading="Empanelled Hospitals"
      subHeading="Comprehensive network of authorized hospitals for medical claims processing"
    >
      <div className="space-y-8">
        {/* Hospitals Table */}
        <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              Empanelled Hospital Network
            </h2>
            <p className="text-muted-foreground mt-2">
              Manage and view all hospitals in the empanelled network
            </p>
          </div>

          <div className="p-6">
            <DynamicTable
              tableHeading="Empanelled Hospitals"
              data={getTableData(hospitals)}
              customRender={customRender}
              isLoading={isFetching}
            />
          </div>
        </div>
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!viewHospital} onOpenChange={() => setViewHospital(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Hospital className="w-6 h-6 text-primary" />
              Hospital Details
            </DialogTitle>
          </DialogHeader>

          {viewHospital && (
            <div className="space-y-6">
              {/* Hospital Information */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {viewHospital.hospital_name}
                      </h3>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-start gap-3 mb-4">
                        <MapPin className="w-5 h-5 text-muted-foreground mt-1" />
                        <div>
                          <h4 className="font-semibold mb-1">Address</h4>
                          <p className="text-muted-foreground">{viewHospital.address}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <p className="font-medium">
                            {viewHospital.created_at
                              ? new Date(viewHospital.created_at).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Updated:</span>
                          <p className="font-medium">
                            {viewHospital.updated_at
                              ? new Date(viewHospital.updated_at).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card className="border border-info/20 bg-info/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-info/10 rounded-lg flex items-center justify-center mt-1">
                      <Building2 className="w-4 h-4 text-info" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-info mb-2">Network Information</h4>
                      <p className="text-sm text-info/80">
                        This hospital is part of the empanelled network and is authorized to process
                        medical claims. Patients can visit this facility for cashless treatment and
                        claim processing.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </HelmetWrapper>
  );
};

export default EmpanelledHospitalList;
