import { HelmetWrapper, DynamicTable } from '@/components';
import { useRoomsActiveSessions } from '@/hooks';

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
  const { data = [], isFetching } = useRoomsActiveSessions();

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
      <DynamicTable
        tableHeading="Active Room Sessions"
        data={getTableData(data)}
        customRender={customRender}
        isLoading={isFetching}
      />
    </HelmetWrapper>
  );
};

export default RoomSession;
