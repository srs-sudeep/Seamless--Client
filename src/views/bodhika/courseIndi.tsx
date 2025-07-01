import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  HelmetWrapper,
  DynamicTable,
  Sheet,
  SheetContent,
  SheetTitle,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Popover,
  PopoverTrigger,
  PopoverContent,
  ScrollArea,
  Checkbox,
  Input,
  DateRangePicker,
} from '@/components';
import { useSessionsByCourseId, useSessionAttendance } from '@/hooks';
import {
  ChevronDownIcon,
  Eye,
  Loader2,
  BookOpen,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  BarChart3,
  Clock,
  MapPin,
  Monitor,
  Target,
  TrendingUp,
} from 'lucide-react';

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

const CourseIndi = () => {
  const { course_id } = useParams<{ course_id: string }>();
  const { data: sessions = [], isFetching } = useSessionsByCourseId(course_id);
  const [editSessionId, setEditSessionId] = useState<string | null>(null);
  const [attendanceTab, setAttendanceTab] = useState<
    'registered_present' | 'registered_absent' | 'unregistered_present'
  >('registered_present');
  const [attendanceSubTab, setAttendanceSubTab] = useState<'validated' | 'latest' | 'all'>(
    'validated'
  );

  type AttendanceData = {
    registered_present?: string[];
    registered_absent?: string[];
    unregistered_present?: string[];
    registered_present_count: number;
    unregistered_present_count: number;
    registered_absent_count: number;
  };

  const {
    data: attendances = {
      registered_present: [],
      registered_absent: [],
      unregistered_present: [],
      registered_present_count: 0,
      unregistered_present_count: 0,
      registered_absent_count: 0,
    },
    isLoading: attendanceLoading,
  } = useSessionAttendance(
    typeof editSessionId === 'string' && editSessionId ? editSessionId : undefined
  ) as {
    data: AttendanceData | undefined;
    isLoading: boolean;
  };

  const getStatusChip = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-success/10 text-success border-success';
      default:
        return 'bg-chip-blue/10 text-chip-blue border-chip-blue';
    }
  };

  const getStatusChipClass = (count: number) =>
    count >= 2
      ? 'bg-success/10 text-success border-success'
      : 'bg-destructive/10 text-destructive border-destructive';

  // Helper functions for subcategories
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
        Status: type === 'registered_absent' ? 'Absent' : records.length >= 2 ? 'Valid' : 'Invalid',
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

  const getTableData = (sessions: any[]) =>
    Array.isArray(sessions)
      ? sessions.map(session => ({
          'Session Id': session.session_id,
          'Start Time': session.start_time,
          'End Time': session.end_time,
          'Instructor Ldap': session.instructor_ldap,
          Rooms: Array.isArray(session.rooms)
            ? session.rooms
                .map(
                  (room: any) => `${room.room_id}${room.room_name ? ` (${room.room_name})` : ''}`
                )
                .join(', ')
            : '',
          Status: session.status,
          ViewAttendance: session.session_id,
          _row: session,
          _roomIds: Array.isArray(session.rooms)
            ? session.rooms.map((room: any) => room.room_id)
            : [],
        }))
      : [];

  const customRender = {
    'Session Id': (value: string) => <span className="font-mono">{truncateId(value)}</span>,
    'Start Time': (value: string) => <span>{formatDateTime(value)}</span>,
    'End Time': (value: string) => <span>{formatDateTime(value)}</span>,
    Rooms: (_: string, row: any) => (
      <div>
        {Array.isArray(row._row.rooms) && row._row.rooms.length > 0 ? (
          row._row.rooms.map((room: any, idx: number) => (
            <div key={idx} className="mb-1">
              <span>{room.room_id}</span>
              {room.room_name && (
                <div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-xl bg-muted-foreground/10 text-foreground text-xs">
                    {room.room_name}
                  </span>
                </div>
              )}
            </div>
          ))
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        )}
      </div>
    ),
    Status: (value: string) => {
      const statusStr = typeof value === 'string' ? value : value ? String(value) : '';
      return (
        <span
          className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold ${getStatusChip(
            statusStr
          )}`}
        >
          {statusStr.charAt(0).toUpperCase() + statusStr.slice(1)}
        </span>
      );
    },
    ViewAttendance: (session_id: string, _: any) => (
      <Button size="sm" variant="outline" onClick={() => setEditSessionId(session_id)}>
        <Eye className="w-4 h-4" />
      </Button>
    ),
  };
  // Attendance table columns for each type
  const getRegisteredPresentTableData = (arr: any[]) => {
    const filtered = filterAttendance(arr);
    if (attendanceSubTab === 'validated') return getValidated(filtered, 'registered_present');
    if (attendanceSubTab === 'latest') return getLatestOnly(filtered);
    return getAllRecords(filtered);
  };
  const getRegisteredAbsentTableData = (arr: any[]) => {
    const filtered = filterAttendance(arr);
    if (attendanceSubTab === 'validated') return getValidated(filtered, 'registered_absent');
    if (attendanceSubTab === 'latest') return getLatestOnly(filtered);
    return getAllRecords(filtered);
  };
  const getUnregisteredPresentTableData = (arr: any[]) => {
    const filtered = filterAttendance(arr);
    if (attendanceSubTab === 'validated') return getValidated(filtered, 'unregistered_present');
    if (attendanceSubTab === 'latest') return getLatestOnly(filtered);
    return getAllRecords(filtered);
  };

  // Custom render for validated
  const validatedCustomRender = {
    'Student Id': (value: string) => <span className="font-mono">{truncateId(value)}</span>,
    'First Mark Time': (value: string) => <span>{value}</span>,
    'Last Mark Time': (value: string) => <span>{value}</span>,
    Count: (value: number) => <span>{value}</span>,
    Status: (value: string, row: any) => (
      <span
        className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold ${getStatusChipClass(row['Count'])}`}
      >
        {value}
      </span>
    ),
  };

  const attendanceCustomRender = {
    'Student Id': (value: string) => <span className="font-mono">{truncateId(value)}</span>,
    'Device Id': (value: string) => <span className="font-mono">{truncateId(value)}</span>,
    'Room Id': (value: string) => <span className="font-mono">{truncateId(value)}</span>,
    Time: (value: string) => <span>{value}</span>,
  };

  // --- Attendance Filters State ---
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), 0, 1); // Jan 1st
  const defaultTo = new Date(now.getFullYear(), 11, 31); // Dec 31st

  const [attendanceFilters, setAttendanceFilters] = useState<{
    search?: string;
    device?: string;
    room_id?: string;
    dateRange?: { from?: Date; to?: Date };
  }>({
    dateRange: { from: defaultFrom, to: defaultTo },
  });

  // Local state for temp date range (for Apply button)
  const [tempDateRange, setTempDateRange] = useState<{ from: Date; to: Date }>({
    from: defaultFrom,
    to: defaultTo,
  });

  // Get all unique device ids and room ids from attendance data
  const allDevices = useMemo(() => {
    const set = new Set<string>();
    [
      ...(attendances.registered_present || []),
      ...(attendances.registered_absent || []),
      ...(attendances.unregistered_present || []),
    ].forEach((a: any) => {
      if (a.device_id) set.add(a.device_id);
    });
    return Array.from(set);
  }, [attendances]);

  const allRoomIds = useMemo(() => {
    const set = new Set<string>();
    [
      ...(attendances.registered_present || []),
      ...(attendances.registered_absent || []),
      ...(attendances.unregistered_present || []),
    ].forEach((a: any) => {
      if (a.room_id) set.add(a.room_id);
    });
    return Array.from(set);
  }, [attendances]);

  // --- Filtering logic for attendance arrays ---
  function filterAttendance(arr: any[]) {
    if (!Array.isArray(arr)) return [];
    return arr.filter(a => {
      // Search
      if (
        attendanceFilters.search &&
        !Object.values(a).join(' ').toLowerCase().includes(attendanceFilters.search.toLowerCase())
      ) {
        return false;
      }
      // Device
      if (attendanceFilters.device && a.device_id !== attendanceFilters.device) {
        return false;
      }
      // Room
      if (attendanceFilters.room_id && a.room_id !== attendanceFilters.room_id) {
        return false;
      }
      // Date Range
      if (
        attendanceFilters.dateRange &&
        (attendanceFilters.dateRange.from || attendanceFilters.dateRange.to)
      ) {
        const attDate = new Date(a.timestamp);
        if (attendanceFilters.dateRange.from) {
          const from = new Date(attendanceFilters.dateRange.from);
          from.setHours(0, 0, 0, 0);
          if (attDate < from) return false;
        }
        if (attendanceFilters.dateRange.to) {
          const to = new Date(attendanceFilters.dateRange.to);
          to.setHours(23, 59, 59, 999);
          if (attDate > to) return false;
        }
      }
      return true;
    });
  }

  // Calculate session statistics
  const totalSessions = sessions.length;
  const activeSessions = sessions.filter(s => s.status?.toLowerCase() === 'active').length;

  return (
    <HelmetWrapper
      title="Course Sessions | Seamless"
      heading={`Course Sessions`}
      subHeading={`Detailed session analysis and attendance tracking for course: ${course_id}`}
      isBackbuttonVisible={true}
    >
      <div className="space-y-8">
        {/* Course Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card-blue-gradient rounded-2xl p-6 border-2 border-card-blue">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-blue-icon rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-blue font-medium mb-1">Course ID</p>
                <p className="text-lg font-bold text-card-blue font-mono">{course_id}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-green-gradient rounded-2xl p-6 border-2 border-card-green">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-green-icon rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-green font-medium mb-1">Total Sessions</p>
                <p className="text-2xl font-bold text-card-green">{totalSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-purple-gradient rounded-2xl p-6 border-2 border-card-purple">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-purple-icon rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-purple font-medium mb-1">Active Sessions</p>
                <p className="text-2xl font-bold text-card-purple">{activeSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-card-orange-gradient rounded-2xl p-6 border-2 border-card-orange">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-card-orange-icon rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-background" />
              </div>
              <div className="text-right">
                <p className="text-sm text-card-orange font-medium mb-1">Completion</p>
                <p className="text-2xl font-bold text-card-orange">
                  {totalSessions > 0
                    ? Math.round(((totalSessions - activeSessions) / totalSessions) * 100)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl border-2 border-border shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              Course Sessions
            </h2>
            <p className="text-muted-foreground mt-2">
              Complete overview of all sessions with attendance tracking capabilities
            </p>
          </div>

          <div className="p-6">
            <DynamicTable
              tableHeading="Sessions"
              data={getTableData(sessions)}
              isLoading={isFetching}
              customRender={customRender}
            />
          </div>
        </div>
      </div>

      {/* Enhanced Attendance Sheet */}
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
          style={{ width: '90vw', maxWidth: '1200px' }}
        >
          <div className="flex-1 overflow-y-auto flex flex-row">
            {/* Enhanced Filter Column */}
            <div className="w-full sm:w-80 md:w-88 lg:w-96 border-r-2 border-border bg-gradient-to-b from-muted/20 to-muted/10 p-6 space-y-6">
              <div className="border-b border-border pb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  Attendance Filters
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Apply filters to refine attendance data
                </p>
              </div>

              {/* Enhanced Search Bar */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search Students
                </label>
                <div className="relative w-full group">
                  <Input
                    type="text"
                    placeholder="Search by student ID, device, etc..."
                    value={attendanceFilters.search || ''}
                    onChange={e => setAttendanceFilters(f => ({ ...f, search: e.target.value }))}
                    onKeyDown={e => {
                      if (e.key === 'Enter')
                        setAttendanceFilters(f => ({ ...f, search: e.currentTarget.value }));
                    }}
                    className="w-full h-11 pl-4 pr-16 bg-background text-foreground border-2 border-border focus:border-primary transition-colors"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {attendanceFilters.search && (
                      <button
                        onClick={() => setAttendanceFilters(f => ({ ...f, search: '' }))}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-full hover:bg-destructive/10"
                        type="button"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Device Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Filter by Device
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-11 bg-background border-2 border-border hover:border-primary"
                    >
                      <span className="truncate">{attendanceFilters.device || 'All Devices'}</span>
                      <ChevronDownIcon className="ml-2 h-4 w-4 flex-shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-4 bg-background border-2 border-border">
                    <ScrollArea className="max-h-48">
                      <div className="space-y-2">
                        {allDevices.map(device => (
                          <div
                            key={device}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                            onClick={() =>
                              setAttendanceFilters(f => ({
                                ...f,
                                device: f.device === device ? undefined : device,
                              }))
                            }
                          >
                            <Checkbox
                              checked={attendanceFilters.device === device}
                              className="mr-2"
                            />
                            <span className="text-sm font-mono">{device}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    {attendanceFilters.device && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => setAttendanceFilters(f => ({ ...f, device: undefined }))}
                      >
                        Clear Selection
                      </Button>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              {/* Enhanced Room Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Filter by Room
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-11 bg-background border-2 border-border hover:border-primary"
                    >
                      <span className="truncate">{attendanceFilters.room_id || 'All Rooms'}</span>
                      <ChevronDownIcon className="ml-2 h-4 w-4 flex-shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-4 bg-background border-2 border-border">
                    <ScrollArea className="max-h-48">
                      <div className="space-y-2">
                        {allRoomIds.map(room => (
                          <div
                            key={room}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                            onClick={() =>
                              setAttendanceFilters(f => ({
                                ...f,
                                room_id: f.room_id === room ? undefined : room,
                              }))
                            }
                          >
                            <Checkbox
                              checked={attendanceFilters.room_id === room}
                              className="mr-2"
                            />
                            <span className="text-sm font-mono">{room}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    {attendanceFilters.room_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => setAttendanceFilters(f => ({ ...f, room_id: undefined }))}
                      >
                        Clear Selection
                      </Button>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              {/* Enhanced Date Range Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date Range
                </label>
                <div className="space-y-3">
                  <DateRangePicker
                    value={tempDateRange}
                    onChange={range => setTempDateRange(range as { from: Date; to: Date })}
                    className="w-full h-11 border-2 border-border"
                  />
                  <Button
                    size="sm"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={!tempDateRange.from || !tempDateRange.to}
                    onClick={() =>
                      setAttendanceFilters(f => ({
                        ...f,
                        dateRange: tempDateRange,
                      }))
                    }
                  >
                    Apply Date Filter
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced Main Content */}
            <div className="flex-1 p-8 space-y-8">
              {editSessionId && (
                <>
                  {/* Enhanced Header */}
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border-2 border-primary/20">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                        <Users className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-foreground mb-2">
                          Session Attendance
                        </h2>
                        <p className="text-muted-foreground">
                          Session ID:{' '}
                          <span className="font-mono text-primary">{editSessionId}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Attendance Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-card-blue-gradient rounded-xl p-4 border-2 border-card-blue">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-card-blue-icon rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-background" />
                        </div>
                        <div>
                          <p className="text-xs text-card-blue font-medium">Total Students</p>
                          <p className="text-xl font-bold text-card-blue">
                            {filterAttendance(attendances.registered_present || []).length +
                              filterAttendance(attendances.registered_absent || []).length}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card-green-gradient rounded-xl p-4 border-2 border-card-green">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-card-green-icon rounded-lg flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-background" />
                        </div>
                        <div>
                          <p className="text-xs text-card-green font-medium">Valid</p>
                          <p className="text-xl font-bold text-card-green">
                            {
                              getValidated(
                                filterAttendance(attendances.registered_present || []),
                                'registered_present'
                              ).filter((row: any) => row.Status === 'Valid').length
                            }
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
                          <p className="text-xs text-card-red font-medium">Invalid</p>
                          <p className="text-xl font-bold text-card-red">
                            {
                              getValidated(
                                filterAttendance(attendances.registered_present || []),
                                'registered_present'
                              ).filter((row: any) => row.Status === 'Invalid').length
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card-purple-gradient rounded-xl p-4 border-2 border-card-purple">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-card-purple-icon rounded-lg flex items-center justify-center">
                          <Target className="w-5 h-5 text-background" />
                        </div>
                        <div>
                          <p className="text-xs text-card-purple font-medium">Present</p>
                          <p className="text-xl font-bold text-card-purple">
                            {filterAttendance(attendances.registered_present || []).length}
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
                          <p className="text-xs text-card-yellow font-medium">Unregistered</p>
                          <p className="text-xl font-bold text-card-yellow">
                            {filterAttendance(attendances.unregistered_present || []).length}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card-gray-gradient rounded-xl p-4 border-2 border-card-gray">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-card-gray-icon rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-background" />
                        </div>
                        <div>
                          <p className="text-xs text-card-gray font-medium">Absent</p>
                          <p className="text-xl font-bold text-card-gray">
                            {filterAttendance(attendances.registered_absent || []).length}
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
                          Registered Present (
                          {filterAttendance(attendances.registered_present || []).length})
                        </TabsTrigger>
                        <TabsTrigger value="registered_absent" className="text-sm font-semibold">
                          Registered Absent (
                          {filterAttendance(attendances.registered_absent || []).length})
                        </TabsTrigger>
                        <TabsTrigger value="unregistered_present" className="text-sm font-semibold">
                          Unregistered Present (
                          {filterAttendance(attendances.unregistered_present || []).length})
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
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </HelmetWrapper>
  );
};

export default CourseIndi;
