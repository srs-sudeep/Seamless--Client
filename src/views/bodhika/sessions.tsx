import { HelmetWrapper, DynamicTable } from '@/components';
import { useSessions } from '@/hooks/bodhika/useSession.hook';

const Sessions = () => {
  const { data: sessions = [], isLoading } = useSessions();

  const getTableData = (sessions: any[]) =>
    Array.isArray(sessions)
      ? sessions.map(session => ({
          'Session ID': session.session_id,
          'Course ID': session.course_id,
          'Instructor LDAP': session.instructor_ldap,
          'Start Time': session.start_time,
          'End Time': session.end_time,
          Status: session.status,
          Rooms: Array.isArray(session.rooms)
            ? session.rooms.map((room: any) => room.room_id).join(', ')
            : '',
          _row: { ...session },
        }))
      : [];

  return (
    <HelmetWrapper
      title="All Sessions | Seamless"
      heading="All Sessions"
      subHeading="List of all sessions."
    >
      <div className="mx-auto p-6">
        <DynamicTable tableHeading="Sessions" data={getTableData(sessions)} loading={isLoading} />
      </div>
    </HelmetWrapper>
  );
};

export default Sessions;
