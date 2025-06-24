import {
  HelmetWrapper,
  DynamicTable,
  Button,
  Sheet,
  SheetContent,
  SheetTitle,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components';
import { useRoomsActiveSessions, useSessionAttendance } from '@/hooks';
import { Eye, Loader2 } from 'lucide-react';
import { useState } from 'react';

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
  const [editSessionId, setEditSessionId] = useState<string | null>(null);
  const [attendanceTab, setAttendanceTab] = useState<
    'registered_present' | 'registered_absent' | 'unregistered_present'
  >('registered_present');
  const [attendanceSubTab, setAttendanceSubTab] = useState<'validated' | 'latest' | 'all'>(
    'validated'
  );

  // Attendance data for selected session
  const { data: attendances = {}, isLoading: attendanceLoading } = useSessionAttendance(
    editSessionId || undefined
  ) as {
    data: any;
    isLoading: boolean;
  };

  // Table data
  const getTableData = (rooms: any[]) =>
    Array.isArray(rooms)
      ? rooms.map(room => ({
          'Room Id': room.room_id,
          'Course Id': room.course_id,
          'Instructor Ldap': room.instructor_ldap,
          'Session Id': room.session_id,
          'Start Time': room.start_time,
          Status: room.status,
          'View Attendance': room.session_id,
        }))
      : [];

  // Custom render
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
    'View Attendance': (session_id: string) => (
      <Button size="sm" variant="outline" onClick={() => handleViewAttendance(session_id)}>
        <Eye className="w-4 h-4" />
      </Button>
    ),
  };

  const handleViewAttendance = (session_id: string) => {
    setEditSessionId(session_id);
    setAttendanceTab('registered_present');
    setAttendanceSubTab('validated');
  };

  // Attendance helpers (copy from courseIndi/sessions)
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
          'First Mark Time': sorted[0]?.timestamp,
          'Last Mark Time': sorted[sorted.length - 1]?.timestamp,
        };
      }
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
      Time: a.timestamp,
    }));
  }

  function getAllRecords(arr: any[]) {
    if (!Array.isArray(arr)) return [];
    return arr.map(a => ({
      'Student Id': a.student_id,
      'Device Id': a.device_id,
      'Room Id': a.room_id,
      Time: a.timestamp,
    }));
  }

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
    'Student Id': (value: string) => <span className="font-mono">{value}</span>,
    'First Mark Time': (value: string) => <span>{value}</span>,
    'Last Mark Time': (value: string) => <span>{value}</span>,
    Count: (value: number) => <span>{value}</span>,
    Status: (value: string, row: any) => (
      <span
        className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold ${
          row.Count >= 2
            ? 'bg-green-100 text-green-800 border-green-300'
            : 'bg-red-100 text-red-800 border-red-300'
        }`}
      >
        {value}
      </span>
    ),
  };

  const attendanceCustomRender = {
    'Student Id': (value: string) => <span className="font-mono">{value}</span>,
    'Device Id': (value: string) => <span className="font-mono">{value}</span>,
    'Room Id': (value: string) => <span className="font-mono">{value}</span>,
    Time: (value: string) => <span>{value}</span>,
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

export default RoomSession;
