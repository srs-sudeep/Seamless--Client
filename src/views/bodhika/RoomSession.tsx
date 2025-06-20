import { HelmetWrapper, DynamicTable } from '@/components';
import { useRoomsActiveSessions } from '@/hooks/bodhika/useSession.hook';
import { Loader2 } from 'lucide-react';

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
          <DynamicTable tableHeading="Active Room Sessions" data={getTableData(data)} />
        )}
      </div>
    </HelmetWrapper>
  );
};

export default RoomSession;
