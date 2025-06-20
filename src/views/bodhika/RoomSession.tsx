import { HelmetWrapper, DynamicTable } from '@/components';
import { useRoomsActiveSessions } from '@/hooks/bodhika/useSession.hook';
import { Loader2 } from 'lucide-react';

const getStatusChipClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'inactive':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    default:
      return 'bg-blue-100 text-blue-800 border-blue-300';
  }
};

const RoomSession = () => {
  const { data = [], isLoading } = useRoomsActiveSessions();

  // Adjust columns as per your API response structure
  const getTableData = (rooms: any[]) =>
    Array.isArray(rooms)
      ? rooms.map(room => ({
          'Room Id': room.room_id,
          'Course Id': room.course_id,
          'Instructor Ldap': room.instructor_ldap,
          'Session Id': room.session_id,
          'Start Time': room.start_time,
          Status: room.status,
        }))
      : [];

  const customRender = {
    Status: (value: string) => (
      <span
        className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold ${getStatusChipClass(
          value
        )}`}
      >
        {value?.charAt(0).toUpperCase() + value?.slice(1)}
      </span>
    ),
  };

  return (
    <HelmetWrapper
      title="Active Room Sessions | Seamless"
      heading="Active Room Sessions"
      subHeading="All active sessions for rooms."
    >
      <div className="mx-auto p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          <DynamicTable
            tableHeading="Active Room Sessions"
            data={getTableData(data)}
            customRender={customRender}
          />
        )}
      </div>
    </HelmetWrapper>
  );
};

export default RoomSession;
