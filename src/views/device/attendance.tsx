import { DynamicTable, HelmetWrapper } from '@/components';
import { useAttendances } from '@/hooks';
import type { Attendance } from '@/types';

const AttendanceManagement = () => {
  const { data: attendances = [], isFetching } = useAttendances();

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
    <HelmetWrapper
      title="Attendance | Seamless"
      heading="Attendance Management"
      subHeading="View device attendance logs."
    >
      <div className="mx-auto p-6">
        <DynamicTable
          data={getTableData(attendances).map(row => ({
            ...row,
          }))}
          isLoading={isFetching}
        />
      </div>
    </HelmetWrapper>
  );
};

export default AttendanceManagement;
