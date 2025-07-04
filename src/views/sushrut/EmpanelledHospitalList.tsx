import { Loader2, BarChart3 } from 'lucide-react';
import { DynamicTable, HelmetWrapper } from '@/components';
import { useEmpanelledHospitals } from '@/hooks/sushrut/empanelledHospital.hook';
import type { EmpanelledHospital } from '@/types';

const EmpanelledHospitalList = () => {
  const { data: hospitals = [], isFetching } = useEmpanelledHospitals();

  const getTableData = (hospitals: EmpanelledHospital[]) =>
    hospitals.map(hospital => ({
      'Hospital Name': hospital.hospital_name || 'N/A',
      'Full Address': hospital.address || 'N/A',
      _row: { ...hospital },
    }));

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
              isLoading={isFetching}
            />
          </div>
        </div>
      </div>
    </HelmetWrapper>
  );
};

export default EmpanelledHospitalList;
