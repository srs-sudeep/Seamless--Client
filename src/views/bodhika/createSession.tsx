import {
  Button,
  DynamicForm,
  DynamicTable,
  HelmetWrapper,
  Input,
  Label,
  toast,
  PieChartComponent,
} from '@/components';
import {
  useBulkAttendance,
  useCreateSession,
  useMyActiveSessions,
  useMyInstructorCourses,
  useRooms,
  useSessionAttendance,
  useSessionUpdate,
} from '@/hooks';
import { type FieldType as BaseFieldType } from '@/types';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Clock,
  Hash,
  MapPin,
  Monitor,
  Pause,
  User,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type FieldType = BaseFieldType & {
  fields?: BaseFieldType[];
  minItems?: number;
  maxItems?: number;
  section?: string;
};

const CreateSession = () => {
  const createMutation = useCreateSession();
  const sessionUpdate = useSessionUpdate();
  const bulkAttendance = useBulkAttendance();
  const { data: rooms = [] } = useRooms();
  const { data: allCourses = [] } = useMyInstructorCourses();
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [bulkStudentIds, setBulkStudentIds] = useState('');
  const [bulkAttendanceSuccess, setBulkAttendanceSuccess] = useState<boolean | null>(null);
  const [bulkAttendanceMessage, setBulkAttendanceMessage] = useState('');

  const { data: activeSessionsResponse, refetch: refetchActiveSessions } = useMyActiveSessions();
  const activeSessions = activeSessionsResponse?.data;
  const activeSessionsStatus = activeSessionsResponse?.status;

  const courseChips = allCourses.map((c: any) => ({
    value: c.course_id,
    label: {
      id: c.course_code,
      name: c.name,
    },
  }));

  const selectedCourse = useMemo(
    () => allCourses.find((c: any) => c.course_id === formValues.course_id),
    [formValues.course_id, allCourses]
  );

  const roomOptions = rooms.map((r: any) => ({
    value: r.room_id,
    label: r.room_name,
  }));

  const assignedRoomIds: string[] = useMemo(() => {
    if (!selectedCourse || !Array.isArray(selectedCourse.slot_room_id)) return [];
    return selectedCourse.slot_room_id.flatMap((sr: any) =>
      Array.isArray(sr.room_id) ? sr.room_id : typeof sr.room_id === 'string' ? [sr.room_id] : []
    );
  }, [selectedCourse]);

  const schema: FieldType[] = [
    {
      name: 'course_id',
      label: '*Please select your course',
      type: 'chip',
      required: true,
      columns: 2,
      options: courseChips,
      section: 'Session Details',
      className: 'text-destructive text-sm',
    },
    ...(formValues.course_id
      ? [
          {
            name: 'room_ids',
            label: 'Rooms',
            type: 'select',
            required: true,
            columns: 2,
            multiSelect: true,
            options: roomOptions,
            section: 'Session Details',
            default: assignedRoomIds,
          } as FieldType,
        ]
      : []),
  ];

  const handleFormChange = (values: Record<string, any>) => {
    if (values.course_id && values.course_id !== formValues.course_id && allCourses.length > 0) {
      const course = allCourses.find((c: any) => c.course_id === values.course_id);
      const defaultRoomIds =
        course && Array.isArray(course.slot_room_id)
          ? course.slot_room_id.flatMap((sr: any) =>
              Array.isArray(sr.room_id)
                ? sr.room_id
                : typeof sr.room_id === 'string'
                  ? [sr.room_id]
                  : []
            )
          : [];
      setFormValues({
        ...values,
        room_ids: defaultRoomIds,
      });
    } else {
      setFormValues(values);
    }
  };

  const handleStopSession = async () => {
    if (!session?.session_id) return;
    await sessionUpdate.mutateAsync(session.session_id);
    toast({ title: 'Session stopped' });
    await refetchActiveSessions();
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    await createMutation.mutateAsync({
      course_id: formData.course_id,
      room_ids: formData.room_ids,
    });
    toast({ title: 'Session started' });
    setFormValues({});
    refetchActiveSessions();
  };

  const handleBulkAttendance = async () => {
    if (!session || !bulkStudentIds.trim()) {
      setBulkAttendanceSuccess(false);
      setBulkAttendanceMessage('Please enter at least one student ID');
      return;
    }

    // Get any active device ID from the session
    const activeDevice = session.rooms?.find(r => r.device_id)?.device_id;

    if (!activeDevice) {
      setBulkAttendanceSuccess(false);
      setBulkAttendanceMessage('No active devices found in this session');
      return;
    }

    // Parse and clean student IDs
    const studentIdList = bulkStudentIds
      .split(',')
      .map(id => id.trim())
      .filter(Boolean);

    if (studentIdList.length === 0) {
      setBulkAttendanceSuccess(false);
      setBulkAttendanceMessage('Please enter valid student IDs');
      return;
    }

    try {
      await bulkAttendance.mutateAsync({
        device_id: activeDevice,
        insti_ids: studentIdList,
        remark: 'Web App Attendance',
      });

      setBulkAttendanceSuccess(true);
      setBulkAttendanceMessage(
        `Successfully marked attendance for ${studentIdList.length} student(s)`
      );
      setBulkStudentIds('');

      // Refresh attendance data
      await attendanceResponse.refetch();
    } catch (error) {
      setBulkAttendanceSuccess(false);
      setBulkAttendanceMessage('Failed to mark attendance. Please try again.');
      console.error('Bulk attendance error:', error);
    }
  };

  const getCourseDetails = (course_id: string | undefined) =>
    course_id ? allCourses.find((c: any) => c.course_id === course_id) : undefined;

  const getRoomDetails = (room_id: string) => rooms.find((r: any) => r.room_id === room_id);

  const getStatusColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'actives':
        return 'text-success bg-success/20 border';
      case 'paused':
        return 'text-chip-yellow bg-chip-yellow/20 border';
      case 'ended':
        return 'text-foreground bg-muted border';
      default:
        return 'text-primary bg-primary-foreground border';
    }
  };

  const session = (() => {
    if (!activeSessions) return null;
    if (Array.isArray(activeSessions)) {
      if (activeSessions.length === 0) return null;
      if (activeSessions.length === 1 && Object.keys(activeSessions[0]).length === 0) return null;
      return activeSessions[0];
    }
    if (typeof activeSessions === 'object' && Object.keys(activeSessions).length > 0) {
      return activeSessions;
    }
    return null;
  })();

  const sessionId = session?.session_id;
  type AttendanceDataType = {
    registered_present?: any[];
    unregistered_present?: any[];
    [key: string]: any;
  };
  const attendanceResponse = useSessionAttendance(sessionId);
  const attendanceData: AttendanceDataType =
    attendanceResponse?.data && !Array.isArray(attendanceResponse.data)
      ? attendanceResponse.data
      : {};

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const allAttendance: AttendanceDataType[] = [
    ...(attendanceData.registered_present ?? []),
    ...(attendanceData.unregistered_present ?? []),
  ];

  const getAttendanceTableData = (attendance: any[]) =>
    Array.isArray(attendance)
      ? attendance.map((a: any) => ({
          'Student Id': a.student_id,
          'Device Id': a.device_id,
          'Room Id': a.room_id,
          'Room Name': a.room_name,
          Timestamp: formatDateTime(a.timestamp),
        }))
      : [];

  const getAttendanceChartData = () => {
    const registeredPresent = attendanceData.registered_present?.length || 0;
    const unregisteredPresent = attendanceData.unregistered_present?.length || 0;
    const registeredAbsent = attendanceData.registered_absent?.length || 0;

    return [
      {
        name: 'Registered Present',
        value: registeredPresent,
        color: '#22c55e', // green  #22c55e
      },
      {
        name: 'Unregistered Present',
        value: unregisteredPresent,
        color: '#3b82f6', // blue  #3b82f6
      },
      {
        name: 'Registered Absent',
        value: registeredAbsent,
        color: '#ef4444', // red #ef4444
      },
    ];
  };

  useEffect(() => {
    // Set up auto-refresh for attendance data every second
    const intervalId = setInterval(() => {
      if (sessionId) {
        attendanceResponse.refetch();
      }
    }, 1000); // Refresh every second

    return () => clearInterval(intervalId); // Clean up on unmount
  }, [sessionId]);

  return (
    <HelmetWrapper
      title="Sessions | Seamless"
      heading="Sessions"
      subHeading="Start a new session for your course."
    >
      <div className="p-6 bg-background rounded-xl">
        {activeSessionsStatus === 202 ? (
          <DynamicForm
            schema={schema}
            onSubmit={handleSubmit}
            submitButtonText={createMutation.isPending ? 'Starting...' : 'Start Session'}
            disabled={createMutation.isPending}
            defaultValues={formValues}
            onChange={handleFormChange}
          />
        ) : (
          <div className="mx-auto">
            {/* Active Session Header */}
            <div className="bg-gradient-to-r from-primary/10 to-chip-blue/10 rounded-xl border border-accent-foreground/20 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Active Session</h2>
                  <p className="text-sm text-muted-foreground">Your current teaching session</p>
                </div>
                <div className="ml-auto">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleStopSession}
                    disabled={sessionUpdate.isPending}
                  >
                    <Pause className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Session Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Session ID
                    </p>
                    <p className="font-mono text-sm font-medium text-foreground">
                      {session?.session_id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                  <BookOpen className="h-4 w-4 text-chip-blue" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Course</p>
                    <p className="font-semibold text-sm text-foreground">
                      {getCourseDetails(session?.course_id)?.course_code || session?.course_id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                  <User className="h-4 w-4 text-success" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Instructor
                    </p>
                    <p className="font-medium text-sm text-foreground">
                      {session?.instructor_ldap}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                  <Clock className="h-4 w-4 text-chip-purple" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Started</p>
                    <p className="font-medium text-sm text-foreground">
                      {formatDateTime(session?.start_time ?? '')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 mb-6">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session?.status)}`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-current mr-2"></div>
                  {session?.status || 'Active'}
                </span>
              </div>

              {/* Rooms Section */}
              <div className="bg-background rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-4 w-4 text-destructive" />
                  <h3 className="font-medium text-foreground">
                    Connected Rooms ({Array.isArray(session?.rooms) ? session.rooms.length : 0})
                  </h3>
                </div>

                {Array.isArray(session?.rooms) && session.rooms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {session.rooms.map((room: any, index: number) => {
                      const roomDetail = getRoomDetails(room.room_id);
                      return (
                        <div
                          key={room.room_id || index}
                          className="bg-background rounded-lg p-3 border border-border"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-destructive/10 rounded-md">
                              <MapPin className="h-3.5 w-3.5 text-destructive" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {roomDetail?.room_name || room.room_id}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Monitor className="h-3 w-3" />
                                <span className="truncate">{room.device_id || 'No device'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <MapPin className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No rooms connected to this session
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bulk Attendance Section */}
            {session && (
              <div className="mt-6 bg-background rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-4 w-4 text-accent-foreground" />
                  <h3 className="font-medium text-foreground">Bulk Attendance</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bulkStudentIds" className="text-sm font-medium mb-1 block">
                      Student IDs (comma-separated)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="bulkStudentIds"
                        value={bulkStudentIds}
                        onChange={e => setBulkStudentIds(e.target.value)}
                        placeholder="12345678, 12345679, 12345680..."
                        className="flex-1"
                      />
                      <Button
                        onClick={handleBulkAttendance}
                        disabled={bulkAttendance.isPending || !bulkStudentIds.trim()}
                      >
                        {bulkAttendance.isPending ? 'Processing...' : 'Mark Attendance'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter student IDs separated by commas to mark their attendance
                    </p>
                  </div>

                  {bulkAttendanceSuccess !== null && (
                    <div
                      className={`p-3 rounded-md ${
                        bulkAttendanceSuccess
                          ? 'bg-success/10 border border-success/20'
                          : 'bg-chip-yellow/10 border border-chip-yellow/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {bulkAttendanceSuccess ? (
                          <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-chip-yellow flex-shrink-0" />
                        )}
                        <p
                          className={`text-sm ${
                            bulkAttendanceSuccess ? 'text-success' : 'text-chip-yellow'
                          }`}
                        >
                          {bulkAttendanceMessage}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Attendance Statistics with Pie Chart */}
            {session && (
              <div className="mt-6 bg-background rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-4 w-4 text-chip-purple" />
                  <h3 className="font-medium text-foreground">Attendance Overview</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Pie Chart */}
                  <div className="lg:col-span-2">
                    <PieChartComponent
                      data={getAttendanceChartData()}
                      height={280}
                      innerRadius={60}
                      outerRadius={100}
                      showTooltip={true}
                    />
                  </div>

                  {/* Attendance Stats */}
                  <div className="space-y-3 flex flex-col justify-center">
                    <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-success"></div>
                        <span className="text-sm text-success">Registered Present</span>
                      </div>
                      <span className="font-semibold text-success">
                        {attendanceData.registered_present?.length || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span className="text-sm text-primary">Unregistered Present</span>
                      </div>
                      <span className="font-semibold text-primary">
                        {attendanceData.unregistered_present?.length || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-destructive"></div>
                        <span className="text-sm text-destructive">Registered Absent</span>
                      </div>
                      <span className="font-semibold text-destructive">
                        {attendanceData.registered_absent?.length || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg border border-secondary">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">Total Students</span>
                      </div>
                      <span className="font-bold text-foreground">
                        {(attendanceData.registered_present?.length || 0) +
                          (attendanceData.unregistered_present?.length || 0) +
                          (attendanceData.registered_absent?.length || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Attendance Section - Single Table */}
            <div className="mt-8">
              <h3 className="font-medium text-foreground mb-2">Attendance</h3>
              <DynamicTable
                tableHeading="All Attendance"
                data={getAttendanceTableData(allAttendance)}
                disableSearch
              />
            </div>
          </div>
        )}
      </div>
    </HelmetWrapper>
  );
};

export default CreateSession;
