import { useState, useMemo } from 'react';
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
import {
  Eye,
  Loader2,
  Calendar,
  Activity,
  Users,
  MapPin,
  BarChart3,
  Target,
  CheckCircle2,
  XCircle,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
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
      return 'bg-success/10 text-success border-success';
    case 'paused':
      return 'bg-chip-yellow/10 text-chip-yellow border-chip-yellow';
    case 'ended':
      return 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground';
    default:
      return 'bg-chip-blue/10 text-chip-blue border-chip-blue';
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

  // Calculate statistics
  const totalSessions = sessions.length;
  const ongoingSessions = sessions.filter(s => !s.end_time).length;
  const completedSessions = sessions.filter(s => s.end_time).length;
  const uniqueInstructors = new Set(sessions.map(s => s.instructor_ldap)).size;
  const uniqueRooms = new Set(
    sessions.flatMap(s => (Array.isArray(s.rooms) ? s.rooms.map(r => r.room_id) : []))
  ).size;
  const uniqueCourses = new Set(sessions.map(s => s.course_id)).size;

  // Separate ongoing and non-ongoing sessions
  useMemo(() => {
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
          Date: session.start_time ? new Date(session.start_time) : null,
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
    Date: (value: Date | string) => (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-pointer">
            {value instanceof Date ? formatDateOnly(value.toISOString()) : formatDateOnly(value)}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {value instanceof Date ? formatDateOnly(value.toISOString()) : formatDateOnly(value)}
        </TooltipContent>
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
        <span className="inline-block px-3 py-1 rounded-full border text-xs font-semibold bg-success/10 text-success border-success">
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
    'View Attendance': (session_id: string) => (
      <Button size="sm" variant="outline" onClick={() => handleViewAttendance(session_id)}>
        <Eye className="w-4 h-4" />
      </Button>
    ),
  };

  // Attendance table helpers (same as courseIndi)
  const getStatusChipClassAttendance = (count: number) =>
    count >= 2
      ? 'bg-success/10 text-success border-success'
      : 'bg-destructive/10 text-destructive border-destructive';

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

  if (isFetching) {
    return (
      <HelmetWrapper
        title="All Sessions | Seamless"
        heading="All Sessions"
        subHeading="Comprehensive view of all academic sessions with detailed attendance tracking"
      >
        <div className="flex justify-center items-center h-96 bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading session data...</p>
          </div>
        </div>
      </HelmetWrapper>
    );
  }

  return (
    <HelmetWrapper
      title="All Sessions | Seamless"
      heading="All Sessions"
      subHeading="Comprehensive view of all academic sessions with detailed attendance tracking and analytics"
    >
      <div className="space-y-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-card-blue-gradient rounded-2xl p-6 border-2 border-card-blue">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-blue-icon rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-blue font-medium mb-1">Total Sessions</p>
                <p className="text-2xl font-bold text-card-blue">{totalSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-green-gradient rounded-2xl p-6 border-2 border-card-green">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-green-icon rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-green font-medium mb-1">Ongoing</p>
                <p className="text-2xl font-bold text-card-green">{ongoingSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-purple-gradient rounded-2xl p-6 border-2 border-card-purple">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-purple-icon rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-purple font-medium mb-1">Completed</p>
                <p className="text-2xl font-bold text-card-purple">{completedSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-orange-gradient rounded-2xl p-6 border-2 border-card-orange">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-orange-icon rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-orange font-medium mb-1">Instructors</p>
                <p className="text-2xl font-bold text-card-orange">{uniqueInstructors}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-pink-gradient rounded-2xl p-6 border-2 border-card-pink">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-pink-icon rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-pink font-medium mb-1">Rooms</p>
                <p className="text-2xl font-bold text-card-pink">{uniqueRooms}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-teal-gradient rounded-2xl p-6 border-2 border-card-teal">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-teal-icon rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-teal font-medium mb-1">Courses</p>
                <p className="text-2xl font-bold text-card-teal">{uniqueCourses}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Sessions Table Container */}
        <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              Session Archive
            </h2>
            <p className="text-muted-foreground mt-2">
              Complete record of all academic sessions with comprehensive filtering and attendance
              tracking
            </p>
          </div>

          <div className="p-6">
            <DynamicTable
              tableHeading="Sessions"
              data={getTableData(sessions)}
              isLoading={isFetching}
              customRender={customRender}
              filterConfig={filterConfig}
              filterMode="local"
            />
          </div>
        </div>

        {/* Session Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Session Activity</h3>
                <p className="text-sm text-muted-foreground">Real-time session status breakdown</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                <span className="text-sm font-medium text-muted-foreground">Active Sessions</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span className="text-lg font-bold text-foreground">{ongoingSessions}</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                <span className="text-sm font-medium text-muted-foreground">
                  Completed Sessions
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
                  <span className="text-lg font-bold text-foreground">{completedSessions}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-6 border-2 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Quick Actions</h3>
                <p className="text-sm text-muted-foreground">Session management tools</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <Eye className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">
                  Click the eye icon to view detailed attendance
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">
                  Filter sessions by date, room, or instructor
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Attendance Side Panel */}
      <Sheet open={!!editSessionId} onOpenChange={open => !open && setEditSessionId(null)}>
        <SheetTitle style={{ display: 'none' }} />
        <SheetContent
          side="right"
          className="
            p-0 
            fixed right-0 top-1/2 -translate-y-1/2
            min-h-fit max-h-[100vh]
            sm:w-[90vw] md:w-[70vw] lg:w-[60vw] xl:w-[50vw]
            bg-gradient-to-br from-background to-muted/30
            border-l-2 border-border
            shadow-2xl
            overflow-hidden
            flex flex-col
            rounded-l-2xl
          "
          style={{ width: '60vw', maxWidth: '1200px' }}
        >
          <div className="flex-1 overflow-y-auto">
            {editSessionId && (
              <>
                {/* Enhanced Header */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 border-b-2 border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                      <Users className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-foreground mb-2">
                        Session Attendance
                      </h2>
                      <p className="text-muted-foreground">
                        Session ID: <span className="font-mono text-primary">{editSessionId}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {/* Enhanced Attendance Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card-blue-gradient rounded-xl p-4 border-2 border-card-blue">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-card-blue-icon rounded-lg flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-background" />
                        </div>
                        <div>
                          <p className="text-xs text-card-blue font-medium">Registered Present</p>
                          <p className="text-xl font-bold text-card-blue">
                            {attendances.registered_present?.length || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card-red-gradient rounded-xl p-4 border-2 border-card-red">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-card-red-icon rounded-lg flex items-center justify-center">
                          <XCircle className="w-5 h-5 text-background" />
                        </div>
                        <div>
                          <p className="text-xs text-card-red font-medium">Registered Absent</p>
                          <p className="text-xl font-bold text-card-red">
                            {attendances.registered_absent?.length || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card-yellow-gradient rounded-xl p-4 border-2 border-card-yellow">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-card-yellow-icon rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-background" />
                        </div>
                        <div>
                          <p className="text-xs text-card-yellow font-medium">
                            Unregistered Present
                          </p>
                          <p className="text-xl font-bold text-card-yellow">
                            {attendances.unregistered_present?.length || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Attendance Tabs */}
                  <div className="bg-gradient-to-br from-background to-muted/20 rounded-2xl border-2 border-border p-6">
                    <Tabs
                      value={attendanceTab}
                      onValueChange={v => {
                        setAttendanceTab(v as any);
                        setAttendanceSubTab('validated');
                      }}
                      className="w-full"
                    >
                      <TabsList className="mb-6 bg-muted/50 p-1">
                        <TabsTrigger value="registered_present" className="text-sm font-semibold">
                          Registered Present ({attendances.registered_present?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="registered_absent" className="text-sm font-semibold">
                          Registered Absent ({attendances.registered_absent?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="unregistered_present" className="text-sm font-semibold">
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
                          <TabsList className="mb-4 bg-background border border-border">
                            <TabsTrigger value="validated">Validated</TabsTrigger>
                            <TabsTrigger value="latest">Latest Only</TabsTrigger>
                            <TabsTrigger value="all">All Records</TabsTrigger>
                          </TabsList>
                          <TabsContent value="validated">
                            {attendanceLoading ? (
                              <div className="flex justify-center items-center h-40 bg-muted/20 rounded-xl">
                                <Loader2 className="animate-spin h-8 w-8 text-primary" />
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
                              <div className="flex justify-center items-center h-40 bg-muted/20 rounded-xl">
                                <Loader2 className="animate-spin h-8 w-8 text-primary" />
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
                              <div className="flex justify-center items-center h-40 bg-muted/20 rounded-xl">
                                <Loader2 className="animate-spin h-8 w-8 text-primary" />
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
                          <TabsList className="mb-4 bg-background border border-border">
                            <TabsTrigger value="validated">Validated</TabsTrigger>
                            <TabsTrigger value="latest">Latest Only</TabsTrigger>
                            <TabsTrigger value="all">All Records</TabsTrigger>
                          </TabsList>
                          <TabsContent value="validated">
                            {attendanceLoading ? (
                              <div className="flex justify-center items-center h-40 bg-muted/20 rounded-xl">
                                <Loader2 className="animate-spin h-8 w-8 text-primary" />
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
                              <div className="flex justify-center items-center h-40 bg-muted/20 rounded-xl">
                                <Loader2 className="animate-spin h-8 w-8 text-primary" />
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
                              <div className="flex justify-center items-center h-40 bg-muted/20 rounded-xl">
                                <Loader2 className="animate-spin h-8 w-8 text-primary" />
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
                          <TabsList className="mb-4 bg-background border border-border">
                            <TabsTrigger value="validated">Validated</TabsTrigger>
                            <TabsTrigger value="latest">Latest Only</TabsTrigger>
                            <TabsTrigger value="all">All Records</TabsTrigger>
                          </TabsList>
                          <TabsContent value="validated">
                            {attendanceLoading ? (
                              <div className="flex justify-center items-center h-40 bg-muted/20 rounded-xl">
                                <Loader2 className="animate-spin h-8 w-8 text-primary" />
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
                              <div className="flex justify-center items-center h-40 bg-muted/20 rounded-xl">
                                <Loader2 className="animate-spin h-8 w-8 text-primary" />
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
                              <div className="flex justify-center items-center h-40 bg-muted/20 rounded-xl">
                                <Loader2 className="animate-spin h-8 w-8 text-primary" />
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
                  </div>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </HelmetWrapper>
  );
};

export default Sessions;
