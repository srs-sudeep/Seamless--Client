import { Loader2 } from 'lucide-react';
import { DynamicTable, HelmetWrapper } from '@/components';
import { useAttendances } from '@/hooks';
import type { Attendance } from '@/types';

const AttendanceManagement = () => {
  const { data: attendances = [], isLoading } = useAttendances();

  const getTableData = (attendances: Attendance[]) =>
    attendances.map(att => ({
      'Attendance ID': att.attendance_id,
      'Device ID': att.device_id,
      Timestamp: att.timestamp,
      'Institute ID': att.insti_id,
      Remark: att.remark,
      _row: att,
    }));

  return (
    <HelmetWrapper title="Attendance | Seamless">
      <div className="max-w-5xl mx-auto p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          <DynamicTable
            data={getTableData(attendances).map(row => ({
              ...row,
            }))}
            className="bg-background"
          />
        )}
      </div>
    </HelmetWrapper>
  );
};

export default AttendanceManagement;
