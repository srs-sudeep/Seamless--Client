import { useState } from 'react';
import { Loader2, Eye } from 'lucide-react';
import { DynamicTable, Button, HelmetWrapper } from '@/components';
import type { AdditionalInfo } from '@/types';
import { useAdditionalInfos } from '@/hooks';

const AdditionalInfoList = () => {
  const { data: infos = [], isFetching } = useAdditionalInfos();
  const [viewInfo, setViewInfo] = useState<AdditionalInfo | null>(null);

  const handleView = (info: AdditionalInfo) => {
    setViewInfo(info);
  };

  if (isFetching && infos.length === 0) {
    return (
      <HelmetWrapper
        title="Additional Informations | Sushrut"
        heading="Additional Infromations"
        subHeading="All informations Regarding health center"
      >
        <div className="flex justify-center items-center h-96 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading Informations ...</p>
          </div>
        </div>
      </HelmetWrapper>
    );
  }
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
  const getTableData = (infos: AdditionalInfo[]) =>
    infos.map(info => {
      return {
        Title: info.title || 'N/A',
        Description: info.description || 'N/A',
      };
    });

  return (
    <HelmetWrapper
      title="Additional Informations"
      heading="Additional Information"
      subHeading="All informations about health Center"
    >
      <DynamicTable
        tableHeading="Additional Inforamtions"
        data={getTableData(infos)}
        customRender={customRender}
        isLoading={isFetching}
      />
    </HelmetWrapper>
  );
};

export default AdditionalInfoList;
