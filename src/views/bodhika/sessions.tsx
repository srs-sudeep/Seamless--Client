import { useState } from 'react';
import {
  HelmetWrapper,
  DynamicTable,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Sheet,
  SheetContent,
  SheetTitle,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components';
import { useSessions, useSessionAttendance } from '@/hooks';
import { Eye, Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { FilterConfig } from '@/types';

const truncateId = (id: string, len = 10) =>
  id && id.length > len ? id.slice(0, len) + '...' : id;

const formatDateTime = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const newDate = date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return newDate;
}; // 2025-06-18T11:18:44.265900

const formatDateOnly = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};

const formatTimeOnly = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
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
  const { data: sessions = [], isFetching } = useSessions();
  const [editSessionId, setEditSessionId] = useState<string | null>(null);
  const [attendanceTab, setAttendanceTab] = useState<
    'registered_present' | 'registered_absent' | 'unregistered_present'
  >('registered_present');
  const [attendanceSubTab, setAttendanceSubTab] = useState<'validated' | 'latest' | 'all'>(
    'validated'
  );

  type AttendanceData = {
    registered_present?: any[];
    registered_absent?: any[];
    unregistered_present?: any[];
  };

  const { data: attendances = {}, isLoading: attendanceLoading } = useSessionAttendance(
    editSessionId || undefined
  ) as {
    data: AttendanceData;
    isLoading: boolean;
  };

  // Separate ongoing and non-ongoing sessions
  const [ongoing, others] = useMemo(() => {
    const ongoingSessions = [];
    const otherSessions = [];
    for (const session of sessions) {
      if (!session.end_time) {
        ongoingSessions.push(session);
      } else {
        otherSessions.push(session);
      }
    }
    return [ongoingSessions, otherSessions];
  }, [sessions]);

  const getTableData = (sessions: any[]) =>
    Array.isArray(sessions)
      ? sessions.map(session => ({
          'Session Id': session.session_id,
          'Course Id': session.course_id,
          'Instructor Ldap': session.instructor_ldap,
          Date: session.start_time,
          'Start Time': session.start_time,
          'End Time': session.end_time,
          Status: session.status,
          Rooms: Array.isArray(session.rooms)
            ? session.rooms.map((room: any) => room.room_id).join(', ')
            : '',
          'View Attendance': session.session_id,
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
    Date: (value: string) => (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-pointer">{formatDateOnly(value)}</span>
        </TooltipTrigger>
        <TooltipContent>{formatDateOnly(value)}</TooltipContent>
      </Tooltip>
    ),
    'Start Time': (value: string) => (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-pointer">{formatTimeOnly(value)}</span>
        </TooltipTrigger>
        <TooltipContent>{formatTimeOnly(value)}</TooltipContent>
      </Tooltip>
    ),
    'End Time': (value: string, _: any) =>
      !value ? (
        <span className="inline-block px-3 py-1 rounded-full border text-xs font-semibold bg-green-100 text-green-800 border-green-300">
          Ongoing
        </span>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-pointer">{formatTimeOnly(value)}</span>
          </TooltipTrigger>
          <TooltipContent>{formatTimeOnly(value)}</TooltipContent>
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
    'View Attendance': (row: any) => (
      <Button size="sm" variant="outline" onClick={() => handleViewAttendance(row['Session Id'])}>
        <Eye className="w-4 h-4" />
      </Button>
    ),
  };

  // Attendance table helpers (same as courseIndi)
  const getStatusChipClassAttendance = (count: number) =>
    count >= 2
      ? 'bg-green-100 text-green-800 border-green-300'
      : 'bg-red-100 text-red-800 border-red-300';

  function getValidated(
    arr: any[],
    type: 'registered_present' | 'registered_absent' | 'unregistered_present'
  ) {
    if (!Array.isArray(arr)) return [];
    const grouped = arr.reduce((acc: Record<string, any[]>, curr) => {
      acc[curr.student_id] = acc[curr.student_id] || [];
      acc[curr.student_id].push(curr);
      return acc;
    }, {});
    return Object.entries(grouped).map(([student_id, records]) => {
      const sorted = records.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      const base = {
        'Student Id': student_id,
        Count: records.length,
        Status: records.length >= 2 ? 'Valid' : 'Invalid',
      };
      if (type === 'registered_present' || type === 'unregistered_present') {
        return {
          ...base,
          'First Mark Time': formatDateTime(sorted[0]?.timestamp),
          'Last Mark Time': formatDateTime(sorted[sorted.length - 1]?.timestamp),
        };
      }
      // For registered_absent, do not include mark times
      return base;
    });
  }

  function getLatestOnly(arr: any[]) {
    if (!Array.isArray(arr)) return [];
    const latestMap: Record<string, any> = {};
    arr.forEach(a => {
      if (
        !latestMap[a.student_id] ||
        new Date(a.timestamp).getTime() > new Date(latestMap[a.student_id].timestamp).getTime()
      ) {
        latestMap[a.student_id] = a;
      }
    });
    return Object.values(latestMap).map(a => ({
      'Student Id': a.student_id,
      'Device Id': a.device_id,
      'Room Id': a.room_id,
      Time: formatDateTime(a.timestamp),
    }));
  }

  function getAllRecords(arr: any[]) {
    if (!Array.isArray(arr)) return [];
    return arr.map(a => ({
      'Student Id': a.student_id,
      'Device Id': a.device_id,
      'Room Id': a.room_id,
      Time: formatDateTime(a.timestamp),
    }));
  }

  // Attendance table columns for each type
  const getRegisteredPresentTableData = (arr: any[]) => {
    if (attendanceSubTab === 'validated') return getValidated(arr, 'registered_present');
    if (attendanceSubTab === 'latest') return getLatestOnly(arr);
    return getAllRecords(arr);
  };

  const getRegisteredAbsentTableData = (arr: any[]) => {
    if (attendanceSubTab === 'validated') return getValidated(arr, 'registered_absent');
    if (attendanceSubTab === 'latest') return getLatestOnly(arr);
    return getAllRecords(arr);
  };

  const getUnregisteredPresentTableData = (arr: any[]) => {
    if (attendanceSubTab === 'validated') return getValidated(arr, 'unregistered_present');
    if (attendanceSubTab === 'latest') return getLatestOnly(arr);
    return getAllRecords(arr);
  };

  // Custom render for validated
  const validatedCustomRender = {
    'Student Id': (value: string) => <span className="font-mono">{truncateId(value)}</span>,
    'First Mark Time': (value: string) => <span>{value}</span>,
    'Last Mark Time': (value: string) => <span>{value}</span>,
    Count: (value: number) => <span>{value}</span>,
    Status: (value: string, row: any) => (
      <span
        className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold ${getStatusChipClassAttendance(row['Count'])}`}
      >
        {value}
      </span>
    ),
  };

  // Custom render for all records/latest (always show Student Id)
  const attendanceCustomRender = {
    'Student Id': (value: string) => <span className="font-mono">{truncateId(value)}</span>,
    'Device Id': (value: string) => <span className="font-mono">{truncateId(value)}</span>,
    'Room Id': (value: string) => <span className="font-mono">{truncateId(value)}</span>,
    Time: (value: string) => <span>{value}</span>,
  };

  // Ongoing sessions first, then others
  const sortedTableData = [...getTableData(ongoing), ...getTableData(others)];

  const handleViewAttendance = (session_id: string) => {
    setEditSessionId(session_id);
    setAttendanceTab('registered_present');
    setAttendanceSubTab('validated');
  };

  // 1. Extract all unique room IDs for filter options
  const allRoomIds = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach(session => {
      if (Array.isArray(session.rooms)) {
        session.rooms.forEach((room: any) => {
          if (room?.room_id) set.add(room.room_id);
        });
      }
    });
    return Array.from(set);
  }, [sessions]);

  // 1. Extract all unique Instructor Ldap for filter options
  const allInstructorLdaps = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach(session => {
      if (session?.instructor_ldap) {
        set.add(session.instructor_ldap);
      }
    });
    return Array.from(set);
  }, [sessions]);

  // 2. Add filterConfig for Rooms and Date Range
  const filterConfig: FilterConfig[] = [
    {
      column: 'Rooms',
      type: 'multi-select',
      options: allRoomIds,
    },
    {
      column: 'Status',
      type: 'dropdown',
      options: ['completed', 'ongoing'],
    },
    {
      column: 'Instructor Ldap',
      type: 'dropdown',
      options: allInstructorLdaps,
    },
    {
      column: 'Date',
      type: 'date-range',
    },
  ];

  return (
    <HelmetWrapper
      title="All Sessions | Seamless"
      heading="All Sessions"
      subHeading="List of all sessions."
    >
      <DynamicTable
        tableHeading="Sessions"
        data={sortedTableData.map(row => ({
          ...row,
          'View Attendance': customRender['View Attendance'](row),
        }))}
        isLoading={isFetching}
        customRender={{
          ...customRender,
          'View Attendance': customRender['View Attendance'],
        }}
        filterConfig={filterConfig}
      />

      {/* Attendance Side Panel */}
      <Sheet open={!!editSessionId} onOpenChange={open => !open && setEditSessionId(null)}>
        <SheetTitle style={{ display: 'none' }} />
        <SheetContent
          side="right"
          className="
              p-0 
              fixed right-0 top-1/2 -translate-y-1/2
              min-h-fit max-h-[100vh]
              sm:w-[90vw] md:w-[70vw] lg:w-[60vw] xl:w-[50vw]
              bg-card border-l border-border
              shadow-2xl
              overflow-hidden
              flex flex-col
              rounded-l-xl
            "
          style={{ width: '60vw', maxWidth: '1200px' }}
        >
          <div className="flex-1 overflow-y-auto">
            <div className="p-8 space-y-6">
              {editSessionId && (
                <>
                  {/* Header */}
                  <div className="border-b border-border pb-4">
                    <h2 className="text-2xl font-bold text-foreground mb-2">Attendance</h2>
                    <p className="text-sm text-muted-foreground">
                      Attendance for session <span className="font-mono">{editSessionId}</span>
                    </p>
                  </div>
                  {/* Attendance Tabs */}
                  <Tabs
                    value={attendanceTab}
                    onValueChange={v => {
                      setAttendanceTab(v as any);
                      setAttendanceSubTab('validated');
                    }}
                    className="w-full"
                  >
                    <TabsList className="mb-4">
                      <TabsTrigger value="registered_present">
                        Registered Present ({attendances.registered_present?.length || 0})
                      </TabsTrigger>
                      <TabsTrigger value="registered_absent">
                        Registered Absent ({attendances.registered_absent?.length || 0})
                      </TabsTrigger>
                      <TabsTrigger value="unregistered_present">
                        Unregistered Present ({attendances.unregistered_present?.length || 0})
                      </TabsTrigger>
                    </TabsList>
                    {/* Sub Tabs for all three categories */}
                    <TabsContent value="registered_present">
                      <Tabs
                        value={attendanceSubTab}
                        onValueChange={v => setAttendanceSubTab(v as any)}
                        className="w-full"
                      >
                        <TabsList className="mb-2">
                          <TabsTrigger value="validated">Validated</TabsTrigger>
                          <TabsTrigger value="latest">Latest Only</TabsTrigger>
                          <TabsTrigger value="all">All Records</TabsTrigger>
                        </TabsList>
                        <TabsContent value="validated">
                          {attendanceLoading ? (
                            <div className="flex justify-center items-center h-40">
                              <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                            </div>
                          ) : (
                            <DynamicTable
                              tableHeading="Validated"
                              data={getRegisteredPresentTableData(
                                attendances.registered_present || []
                              )}
                              customRender={validatedCustomRender}
                            />
                          )}
                        </TabsContent>
                        <TabsContent value="latest">
                          {attendanceLoading ? (
                            <div className="flex justify-center items-center h-40">
                              <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                            </div>
                          ) : (
                            <DynamicTable
                              tableHeading="Latest Only"
                              data={getRegisteredPresentTableData(
                                attendances.registered_present || []
                              )}
                              customRender={attendanceCustomRender}
                            />
                          )}
                        </TabsContent>
                        <TabsContent value="all">
                          {attendanceLoading ? (
                            <div className="flex justify-center items-center h-40">
                              <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                            </div>
                          ) : (
                            <DynamicTable
                              tableHeading="All Records"
                              data={getRegisteredPresentTableData(
                                attendances.registered_present || []
                              )}
                              customRender={attendanceCustomRender}
                            />
                          )}
                        </TabsContent>
                      </Tabs>
                    </TabsContent>
                    <TabsContent value="registered_absent">
                      <Tabs
                        value={attendanceSubTab}
                        onValueChange={v => setAttendanceSubTab(v as any)}
                        className="w-full"
                      >
                        <TabsList className="mb-2">
                          <TabsTrigger value="validated">Validated</TabsTrigger>
                          <TabsTrigger value="latest">Latest Only</TabsTrigger>
                          <TabsTrigger value="all">All Records</TabsTrigger>
                        </TabsList>
                        <TabsContent value="validated">
                          {attendanceLoading ? (
                            <div className="flex justify-center items-center h-40">
                              <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                            </div>
                          ) : (
                            <DynamicTable
                              tableHeading="Validated"
                              data={getRegisteredAbsentTableData(
                                attendances.registered_absent || []
                              )}
                              customRender={validatedCustomRender}
                            />
                          )}
                        </TabsContent>
                        <TabsContent value="latest">
                          {attendanceLoading ? (
                            <div className="flex justify-center items-center h-40">
                              <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                            </div>
                          ) : (
                            <DynamicTable
                              tableHeading="Latest Only"
                              data={getRegisteredAbsentTableData(
                                attendances.registered_absent || []
                              )}
                              customRender={attendanceCustomRender}
                            />
                          )}
                        </TabsContent>
                        <TabsContent value="all">
                          {attendanceLoading ? (
                            <div className="flex justify-center items-center h-40">
                              <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                            </div>
                          ) : (
                            <DynamicTable
                              tableHeading="All Records"
                              data={getRegisteredAbsentTableData(
                                attendances.registered_absent || []
                              )}
                              customRender={attendanceCustomRender}
                            />
                          )}
                        </TabsContent>
                      </Tabs>
                    </TabsContent>
                    <TabsContent value="unregistered_present">
                      <Tabs
                        value={attendanceSubTab}
                        onValueChange={v => setAttendanceSubTab(v as any)}
                        className="w-full"
                      >
                        <TabsList className="mb-2">
                          <TabsTrigger value="validated">Validated</TabsTrigger>
                          <TabsTrigger value="latest">Latest Only</TabsTrigger>
                          <TabsTrigger value="all">All Records</TabsTrigger>
                        </TabsList>
                        <TabsContent value="validated">
                          {attendanceLoading ? (
                            <div className="flex justify-center items-center h-40">
                              <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                            </div>
                          ) : (
                            <DynamicTable
                              tableHeading="Validated"
                              data={getUnregisteredPresentTableData(
                                attendances.unregistered_present || []
                              )}
                              customRender={validatedCustomRender}
                            />
                          )}
                        </TabsContent>
                        <TabsContent value="latest">
                          {attendanceLoading ? (
                            <div className="flex justify-center items-center h-40">
                              <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                            </div>
                          ) : (
                            <DynamicTable
                              tableHeading="Latest Only"
                              data={getUnregisteredPresentTableData(
                                attendances.unregistered_present || []
                              )}
                              customRender={attendanceCustomRender}
                            />
                          )}
                        </TabsContent>
                        <TabsContent value="all">
                          {attendanceLoading ? (
                            <div className="flex justify-center items-center h-40">
                              <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                            </div>
                          ) : (
                            <DynamicTable
                              tableHeading="All Records"
                              data={getUnregisteredPresentTableData(
                                attendances.unregistered_present || []
                              )}
                              customRender={attendanceCustomRender}
                            />
                          )}
                        </TabsContent>
                      </Tabs>
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </HelmetWrapper>
  );
};

export default Sessions;
