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
} from '@/components';
import { useSessionsByCourseId, useSessionAttendance } from '@/hooks';
import { ChevronDownIcon, Eye, Loader2 } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/dateRangePicker'; // Make sure this is imported

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
    dateRange: { from: defaultFrom, to: defaultTo }, // <-- default value
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

  return (
    <HelmetWrapper
      title="Course Sessions | Seamless"
      heading={`Sessions for Course: ${course_id}`}
      subHeading="All sessions for this course."
      isBackbuttonVisible={true}
    >
      <DynamicTable
        tableHeading="Sessions"
        data={getTableData(sessions)}
        isLoading={isFetching}
        customRender={customRender}
      />

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
          style={{ width: '90vw', maxWidth: '1200px' }}
        >
          <div className="flex-1 overflow-y-auto flex flex-row">
            {/* --- Filter Column --- */}
            <div className="w-full sm:w-72 md:w-80 lg:w-88 border-r border-border bg-background p-4 space-y-4 my-5">
              {/* Search Bar */}
              <div className="relative w-full group">
                <input
                  type="text"
                  placeholder="Search attendance..."
                  value={attendanceFilters.search || ''}
                  onChange={e => setAttendanceFilters(f => ({ ...f, search: e.target.value }))}
                  onKeyDown={e => {
                    if (e.key === 'Enter')
                      setAttendanceFilters(f => ({ ...f, search: e.currentTarget.value }));
                  }}
                  className="w-full h-11 pl-4 pr-16 bg-white dark:bg-gray-900/50 
        border border-gray-200/60 dark:border-gray-700/60 
        rounded-xl shadow-sm backdrop-blur-sm
        focus:border-blue-500 dark:focus:border-blue-400 
        focus:ring-4 focus:ring-blue-100/50 dark:focus:ring-blue-900/30
        text-gray-900 dark:text-gray-100 
        placeholder-gray-400 dark:placeholder-gray-500
        transition-all duration-300 ease-out
        hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600
        group-hover:shadow-lg text-sm sm:text-base"
                />
                {/* Right side icons */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {attendanceFilters.search && (
                    <button
                      onClick={() => setAttendanceFilters(f => ({ ...f, search: '' }))}
                      className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300
            transition-colors duration-200 p-1 rounded-full
            hover:bg-gray-100 dark:hover:bg-gray-800"
                      type="button"
                      title="Clear search"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() =>
                      setAttendanceFilters(f => ({
                        ...f,
                        search: attendanceFilters.search?.trim() || '',
                      }))
                    }
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300
          transition-colors duration-200 p-1.5 rounded-lg
          hover:bg-blue-50 dark:hover:bg-blue-900/20
          focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                    type="button"
                    title="Search"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </button>
                </div>
                <div
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/10 to-blue-500/20 
        opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none -z-10 blur-sm"
                />
              </div>

              {/* Device Dropdown */}
              <div className="w-full sm:w-auto sm:min-w-[160px] lg:min-w-[180px] relative">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full flex justify-between items-center h-10 sm:h-11 text-sm"
                    >
                      <span className="truncate">
                        {attendanceFilters.device
                          ? allDevices.find(d => d === attendanceFilters.device) ||
                            attendanceFilters.device
                          : 'Filter Device'}
                      </span>
                      <ChevronDownIcon className="ml-2 h-4 w-4 flex-shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2">
                    <ScrollArea className="min-h-16 max-h-48">
                      {allDevices.map(device => (
                        <div
                          key={device}
                          className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                          onClick={() =>
                            setAttendanceFilters(f => ({
                              ...f,
                              device: f.device === device ? undefined : device,
                            }))
                          }
                        >
                          <Checkbox
                            checked={attendanceFilters.device === device}
                            onCheckedChange={() =>
                              setAttendanceFilters(f => ({
                                ...f,
                                device: f.device === device ? undefined : device,
                              }))
                            }
                            className="mr-2"
                            tabIndex={-1}
                            aria-label={device}
                          />
                          <span className="text-sm">{device}</span>
                        </div>
                      ))}
                    </ScrollArea>
                    {attendanceFilters.device && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full text-sm"
                        onClick={() =>
                          setAttendanceFilters(f => ({
                            ...f,
                            device: undefined,
                          }))
                        }
                      >
                        Clear
                      </Button>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              {/* Room Dropdown */}
              <div className="w-full sm:w-auto sm:min-w-[160px] lg:min-w-[180px] relative">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full flex justify-between items-center h-10 sm:h-11 text-sm"
                    >
                      <span className="truncate">
                        {attendanceFilters.room_id
                          ? allRoomIds.find(r => r === attendanceFilters.room_id) ||
                            attendanceFilters.room_id
                          : 'Filter Room'}
                      </span>
                      <ChevronDownIcon className="ml-2 h-4 w-4 flex-shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2">
                    <ScrollArea className="min-h-16 max-h-48">
                      {allRoomIds.map(room => (
                        <div
                          key={room}
                          className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                          onClick={() =>
                            setAttendanceFilters(f => ({
                              ...f,
                              room_id: f.room_id === room ? undefined : room,
                            }))
                          }
                        >
                          <Checkbox
                            checked={attendanceFilters.room_id === room}
                            onCheckedChange={() =>
                              setAttendanceFilters(f => ({
                                ...f,
                                room_id: f.room_id === room ? undefined : room,
                              }))
                            }
                            className="mr-2"
                            tabIndex={-1}
                            aria-label={room}
                          />
                          <span className="text-sm">{room}</span>
                        </div>
                      ))}
                    </ScrollArea>
                    {attendanceFilters.room_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full text-sm"
                        onClick={() =>
                          setAttendanceFilters(f => ({
                            ...f,
                            room_id: undefined,
                          }))
                        }
                      >
                        Clear
                      </Button>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date Range Picker */}
              <div className="w-full sm:w-auto sm:min-w-[220px] lg:min-w-[250px] flex items-center gap-2">
                <DateRangePicker
                  value={tempDateRange}
                  onChange={range => setTempDateRange(range as { from: Date; to: Date })}
                  className="w-full h-10 sm:h-11"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-2"
                  disabled={!tempDateRange.from || !tempDateRange.to}
                  onClick={() =>
                    setAttendanceFilters(f => ({
                      ...f,
                      dateRange: tempDateRange,
                    }))
                  }
                >
                  Apply
                </Button>
              </div>
            </div>
            {/* --- Main Content --- */}
            <div className="flex-1 p-8 space-y-6">
              {editSessionId && (
                <>
                  {/* Header */}
                  <div className="border-b border-border pb-4">
                    <h2 className="text-2xl font-bold text-foreground mb-2">Attendance</h2>
                    <p className="text-sm text-muted-foreground">
                      Attendance for session <span className="font-mono">{editSessionId}</span>
                    </p>
                  </div>
                  {/* Attendance Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                    {/* Total Students */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow border p-4 flex flex-col items-center">
                      <span className="text-xs text-muted-foreground mb-1">Total Students</span>
                      <span className="text-xl font-bold">
                        {filterAttendance(attendances.registered_present || []).length +
                          filterAttendance(attendances.registered_absent || []).length}
                      </span>
                    </div>
                    {/* Valid Attendance */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow border p-4 flex flex-col items-center">
                      <span className="text-xs text-muted-foreground mb-1">Valid Attendance</span>
                      <span className="text-xl font-bold">
                        {
                          getValidated(
                            filterAttendance(attendances.registered_present || []),
                            'registered_present'
                          ).filter((row: any) => row.Status === 'Valid').length
                        }
                      </span>
                    </div>
                    {/* Invalid Attendance */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow border p-4 flex flex-col items-center">
                      <span className="text-xs text-muted-foreground mb-1">Invalid Attendance</span>
                      <span className="text-xl font-bold">
                        {
                          getValidated(
                            filterAttendance(attendances.registered_present || []),
                            'registered_present'
                          ).filter((row: any) => row.Status === 'Invalid').length
                        }
                      </span>
                    </div>
                    {/* Registered Present */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow border p-4 flex flex-col items-center">
                      <span className="text-xs text-muted-foreground mb-1">Registered Present</span>
                      <span className="text-xl font-bold">
                        {filterAttendance(attendances.registered_present || []).length}
                      </span>
                    </div>
                    {/* Unregistered Present */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow border p-4 flex flex-col items-center">
                      <span className="text-xs text-muted-foreground mb-1">
                        Unregistered Present
                      </span>
                      <span className="text-xl font-bold">
                        {filterAttendance(attendances.unregistered_present || []).length}
                      </span>
                    </div>
                    {/* Absent */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow border p-4 flex flex-col items-center">
                      <span className="text-xs text-muted-foreground mb-1">Absent</span>
                      <span className="text-xl font-bold">
                        {filterAttendance(attendances.registered_absent || []).length}
                      </span>
                    </div>
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
                        Registered Present (
                        {filterAttendance(attendances.registered_present || []).length})
                      </TabsTrigger>
                      <TabsTrigger value="registered_absent">
                        Registered Absent (
                        {filterAttendance(attendances.registered_absent || []).length})
                      </TabsTrigger>
                      <TabsTrigger value="unregistered_present">
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

      {/* Responsive Filters */}
      {/* Top bar for small screens */}
      <div className="block md:hidden p-4 border-b border-border bg-background space-y-3">
        {/* Search Bar */}
        <div className="relative w-full group">
          <input
            type="text"
            placeholder="Search attendance..."
            value={attendanceFilters.search || ''}
            onChange={e => setAttendanceFilters(f => ({ ...f, search: e.target.value }))}
            onKeyDown={e => {
              if (e.key === 'Enter')
                setAttendanceFilters(f => ({ ...f, search: e.currentTarget.value }));
            }}
            className="w-full h-11 pl-4 pr-16 bg-white dark:bg-gray-900/50 border border-gray-200/60 dark:border-gray-700/60 rounded-xl shadow-sm text-sm sm:text-base"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {attendanceFilters.search && (
              <button
                onClick={() => setAttendanceFilters(f => ({ ...f, search: '' }))}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1 rounded-full"
                type="button"
                title="Clear search"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
            <button
              onClick={() =>
                setAttendanceFilters(f => ({
                  ...f,
                  search: attendanceFilters.search?.trim() || '',
                }))
              }
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 p-1.5 rounded-lg"
              type="button"
              title="Search"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </div>
        {/* Device Dropdown */}
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full flex justify-between items-center h-10 text-sm"
              >
                <span className="truncate">
                  {attendanceFilters.device
                    ? allDevices.find(d => d === attendanceFilters.device) ||
                      attendanceFilters.device
                    : 'Filter Device'}
                </span>
                <ChevronDownIcon className="ml-2 h-4 w-4 flex-shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2">
              <ScrollArea className="min-h-16 max-h-48">
                {allDevices.map(device => (
                  <div
                    key={device}
                    className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() =>
                      setAttendanceFilters(f => ({
                        ...f,
                        device: f.device === device ? undefined : device,
                      }))
                    }
                  >
                    <Checkbox
                      checked={attendanceFilters.device === device}
                      onCheckedChange={() =>
                        setAttendanceFilters(f => ({
                          ...f,
                          device: f.device === device ? undefined : device,
                        }))
                      }
                      className="mr-2"
                      tabIndex={-1}
                      aria-label={device}
                    />
                    <span className="text-sm">{device}</span>
                  </div>
                ))}
              </ScrollArea>
              {attendanceFilters.device && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full text-sm"
                  onClick={() =>
                    setAttendanceFilters(f => ({
                      ...f,
                      device: undefined,
                    }))
                  }
                >
                  Clear
                </Button>
              )}
            </PopoverContent>
          </Popover>
        </div>
        {/* Room Dropdown */}
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full flex justify-between items-center h-10 text-sm"
              >
                <span className="truncate">
                  {attendanceFilters.room_id
                    ? allRoomIds.find(r => r === attendanceFilters.room_id) ||
                      attendanceFilters.room_id
                    : 'Filter Room'}
                </span>
                <ChevronDownIcon className="ml-2 h-4 w-4 flex-shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2">
              <ScrollArea className="min-h-16 max-h-48">
                {allRoomIds.map(room => (
                  <div
                    key={room}
                    className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() =>
                      setAttendanceFilters(f => ({
                        ...f,
                        room_id: f.room_id === room ? undefined : room,
                      }))
                    }
                  >
                    <Checkbox
                      checked={attendanceFilters.room_id === room}
                      onCheckedChange={() =>
                        setAttendanceFilters(f => ({
                          ...f,
                          room_id: f.room_id === room ? undefined : room,
                        }))
                      }
                      className="mr-2"
                      tabIndex={-1}
                      aria-label={room}
                    />
                    <span className="text-sm">{room}</span>
                  </div>
                ))}
              </ScrollArea>
              {attendanceFilters.room_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full text-sm"
                  onClick={() =>
                    setAttendanceFilters(f => ({
                      ...f,
                      room_id: undefined,
                    }))
                  }
                >
                  Clear
                </Button>
              )}
            </PopoverContent>
          </Popover>
        </div>
        {/* Date Range Picker */}
        <div className="flex items-center gap-2">
          <DateRangePicker
            value={tempDateRange}
            onChange={range => setTempDateRange(range as { from: Date; to: Date })}
            className="w-full h-10"
          />
          <Button
            size="sm"
            variant="outline"
            className="ml-2"
            disabled={!tempDateRange.from || !tempDateRange.to}
            onClick={() =>
              setAttendanceFilters(f => ({
                ...f,
                dateRange: tempDateRange,
              }))
            }
          >
            Apply
          </Button>
        </div>
      </div>
    </HelmetWrapper>
  );
};

export default CourseIndi;
