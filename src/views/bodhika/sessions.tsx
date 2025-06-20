import { HelmetWrapper, DynamicTable, Tooltip, TooltipTrigger, TooltipContent } from '@/components';
import { useSessions } from '@/hooks/bodhika/useSession.hook';

const truncateId = (id: string, len = 10) =>
  id && id.length > len ? id.slice(0, len) + '...' : id;

const formatDateTime = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const getStatusChipClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'paused':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'ended':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    default:
      return 'bg-blue-100 text-blue-800 border-blue-300';
  }
};

const Sessions = () => {
  const { data: sessions = [], isLoading } = useSessions();

  const getTableData = (sessions: any[]) =>
    Array.isArray(sessions)
      ? sessions.map(session => ({
          'Session Id': session.session_id,
          'Course Id': session.course_id,
          'Instructor Ldap': session.instructor_ldap,
          'Start Time': session.start_time,
          'End Time': session.end_time,
          Status: session.status,
          Rooms: Array.isArray(session.rooms)
            ? session.rooms.map((room: any) => room.room_id).join(', ')
            : '',
          _row: { ...session },
        }))
      : [];

  const customRender = {
    'Session Id': (value: string) => (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-pointer font-mono">{truncateId(value)}</span>
        </TooltipTrigger>
        <TooltipContent>{value}</TooltipContent>
      </Tooltip>
    ),
    'Course Id': (value: string) => (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-pointer font-mono">{truncateId(value)}</span>
        </TooltipTrigger>
        <TooltipContent>{value}</TooltipContent>
      </Tooltip>
    ),
    'Start Time': (value: string) => (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-pointer">{formatDateTime(value)}</span>
        </TooltipTrigger>
        <TooltipContent>{formatDateTime(value)}</TooltipContent>
      </Tooltip>
    ),
    'End Time': (value: string) => (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-pointer">{formatDateTime(value)}</span>
        </TooltipTrigger>
        <TooltipContent>{formatDateTime(value)}</TooltipContent>
      </Tooltip>
    ),
    Status: (value: string) => (
      <span
        className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold ${getStatusChipClass(
          value
        )}`}
      >
        {value}
      </span>
    ),
    Rooms: (value: string) => (
      <span>
        {value.split(', ').map((id: string, idx: number) =>
          id ? (
            <Tooltip key={id + idx}>
              <TooltipTrigger asChild>
                <span className="cursor-pointer font-mono mr-1">
                  {truncateId(id)}
                  {idx < value.split(', ').length - 1 ? ',' : ''}
                </span>
              </TooltipTrigger>
              <TooltipContent>{id}</TooltipContent>
            </Tooltip>
          ) : null
        )}
      </span>
    ),
  };

  return (
    <HelmetWrapper
      title="All Sessions | Seamless"
      heading="All Sessions"
      subHeading="List of all sessions."
    >
      <div className="mx-auto p-6">
        <DynamicTable
          tableHeading="Sessions"
          data={getTableData(sessions)}
          loading={isLoading}
          customRender={customRender}
        />
      </div>
    </HelmetWrapper>
  );
};

export default Sessions;
