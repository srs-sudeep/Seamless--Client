import { useState, useMemo } from 'react';
import { HelmetWrapper, DynamicForm, toast, DynamicTable, Button } from '@/components';
import {
  useCreateSession,
  useMyActiveSessions,
  useSessionAttendance,
  useSessionUpdate,
  useMyInstructorCourses,
  useRooms,
} from '@/hooks';
import { type FieldType as BaseFieldType } from '@/types';
import { BookOpen, User, Clock, Activity, MapPin, Monitor, Hash, Pause } from 'lucide-react';

type FieldType = BaseFieldType & {
  fields?: BaseFieldType[];
  minItems?: number;
  maxItems?: number;
  section?: string;
};

const CreateSession = () => {
  const createMutation = useCreateSession();
  const sessionUpdate = useSessionUpdate();
  const { data: rooms = [] } = useRooms();
  const { data: allCourses = [] } = useMyInstructorCourses();
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  // Fetch active sessions (refetch function available)
  const { data: activeSessionsResponse, refetch: refetchActiveSessions } = useMyActiveSessions();
  const activeSessions = activeSessionsResponse?.data;
  const activeSessionsStatus = activeSessionsResponse?.status;

  // Prepare course chips (show only course_code)
  const courseChips = allCourses.map((c: any) => ({
    value: c.course_id,
    label: {
      id: c.course_code,
      name: c.name,
    },
  }));

  // Find selected course details from all courses
  const selectedCourse = useMemo(
    () => allCourses.find((c: any) => c.course_id === formValues.course_id),
    [formValues.course_id, allCourses]
  );

  // Prepare room options
  const roomOptions = rooms.map((r: any) => ({
    value: r.room_id,
    label: r.room_name,
  }));

  // Get all room_ids for the selected course (from slot_room_id)
  const assignedRoomIds: string[] = useMemo(() => {
    if (!selectedCourse || !Array.isArray(selectedCourse.slot_room_id)) return [];
    // Flatten all room_ids from all slot_room_id entries
    return selectedCourse.slot_room_id.flatMap((sr: any) =>
      Array.isArray(sr.room_id) ? sr.room_id : typeof sr.room_id === 'string' ? [sr.room_id] : []
    );
  }, [selectedCourse]);

  // DynamicForm schema
  const schema: FieldType[] = [
    {
      name: 'course_id',
      label: '*Please select your course',
      type: 'chip',
      required: true,
      columns: 2,
      options: courseChips,
      section: 'Session Details',
      className: 'text-red-500 text-sm',
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
            default: assignedRoomIds, // <-- Use all assigned room_ids for the selected course
          } as FieldType,
        ]
      : []),
  ];

  // Ensure default room(s) are selected when course changes
  const handleFormChange = (values: Record<string, any>) => {
    if (values.course_id && values.course_id !== formValues.course_id && allCourses.length > 0) {
      const course = allCourses.find((c: any) => c.course_id === values.course_id);
      // Get all room_ids for the selected course
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

  // Stop session handler
  const handleStopSession = async () => {
    if (!session?.session_id) return;
    await sessionUpdate.mutateAsync(session.session_id);
    toast({ title: 'Session stopped' });
    await refetchActiveSessions();
  };

  // Only show toast when a session is actually started, not when there is no active session
  const handleSubmit = async (formData: Record<string, any>) => {
    await createMutation.mutateAsync({
      course_id: formData.course_id,
      room_ids: formData.room_ids,
    });
    toast({ title: 'Session started' });
    setFormValues({}); // <-- Clear the form after starting session
    refetchActiveSessions();
  };

  // Helper to get course details for the active session
  const getCourseDetails = (course_id: string | undefined) =>
    course_id ? allCourses.find((c: any) => c.course_id === course_id) : undefined;

  // Helper to get room details for the active session
  const getRoomDetails = (room_id: string) => rooms.find((r: any) => r.room_id === room_id);

  // Format date/time
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

  // Get status color
  const getStatusColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
      case 'paused':
        return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'ended':
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
      default:
        return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20';
    }
  };

  // Always recalculate session just before return
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
  const { data: attendanceData = [], isLoading: attendanceLoading } =
    useSessionAttendance(sessionId);

  const getAttendanceTableData = (attendance: any[]) =>
    Array.isArray(attendance)
      ? attendance.map((a: any) => ({
          'Student Ldap': a.insti_id,
          Timestamp: formatDateTime(a.timestamp),
          Device: a.device_id,
          'Attendance Id': a.attendance_id,
        }))
      : [];

  return (
    <HelmetWrapper
      title="Sessions | Seamless"
      heading="Sessions"
      subHeading="Start a new session for your course."
    >
      <div className="mx-6 p-6 bg-background rounded-xl">
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
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Active Session
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your current teaching session
                  </p>
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
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Session ID
                    </p>
                    <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                      {session?.session_id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Course
                    </p>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      {getCourseDetails(session?.course_id)?.course_code || session?.course_id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <User className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Instructor
                    </p>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {session?.instructor_ldap}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Started
                    </p>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
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
              <div className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  <h3 className="font-medium text-gray-900 dark:text-white">
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
                          className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 bg-orange-100 dark:bg-orange-900/40 rounded-md">
                              <MapPin className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {roomDetail?.room_name || room.room_id}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
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
                    <MapPin className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No rooms connected to this session
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Attendance Section */}
            <div className="mt-8">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Attendance</h3>
              <DynamicTable
                data={getAttendanceTableData(attendanceData)}
                loading={attendanceLoading}
                tableHeading="Live Attendance"
              />
            </div>
          </div>
        )}
      </div>
    </HelmetWrapper>
  );
};

export default CreateSession;
