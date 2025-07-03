import {
  Button,
  DynamicTable,
  HelmetWrapper,
  Input,
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components';
import { useAttendance } from '@/hooks';
import { FilterConfig } from '@/types';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfYear,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfYear,
  subMonths,
} from 'date-fns';
import { useMemo, useState } from 'react';

function getDateArray(start: string, end: string) {
  if (!start || !end) return [];
  return eachDayOfInterval({ start: new Date(start), end: new Date(end) }).map(d =>
    format(d, 'yyyy-MM-dd')
  );
}

const Attendance = () => {
  // Get current year range
  const currentYear = new Date().getFullYear();
  const defaultFrom = startOfYear(new Date(currentYear, 0, 1));
  const defaultTo = endOfYear(new Date(currentYear, 11, 31));

  // State for date range and selected IDs
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: defaultFrom,
    to: defaultTo,
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sidePanel, setSidePanel] = useState<{ open: boolean; studentId: string | null }>({
    open: false,
    studentId: null,
  });

  // Fetch attendance only if both dates are set
  const attendanceEnabled = !!dateRange.from && !!dateRange.to;

  // Fetch attendance data
  const { data, isFetching } = useAttendance(
    attendanceEnabled
      ? {
          institute_ids: selectedIds.length ? selectedIds : [],
          start_date: format(dateRange.from!, 'yyyy-MM-dd'),
          end_date: format(dateRange.to!, 'yyyy-MM-dd'),
          is_deleted: false,
        }
      : {
          institute_ids: [],
          start_date: '',
          end_date: '',
          is_deleted: false,
        },
    attendanceEnabled
  );

  // Extract all IDs from data for default display
  const allIds = useMemo(() => (data ? Object.keys(data) : []), [data]);

  // If no selectedIds, show all IDs from data
  const idsToDisplay = selectedIds.length ? selectedIds : allIds;

  // Prepare table data (only Student ID and Attendance button)
  const getTableData = (attendance: Record<string, Record<string, string>>) =>
    idsToDisplay.map(studentId => ({
      'Student ID': studentId,
      Attendance: '',
      _row: { studentId, records: attendance?.[studentId] ?? {} },
    }));

  // Custom render for Attendance button
  const customRender = {
    Attendance: (_: any, row: any) => (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setSidePanel({ open: true, studentId: row._row.studentId })}
      >
        Attendance
      </Button>
    ),
  };

  // Side panel attendance data for selected student
  const selectedAttendance = sidePanel.studentId && data ? data[sidePanel.studentId] : {};

  // Find the first date in the attendance data for the selected student
  const firstAttendanceDate = useMemo(() => {
    const dates = selectedAttendance ? Object.keys(selectedAttendance) : [];
    if (dates.length === 0) return null;
    return dates.sort()[0];
  }, [selectedAttendance]);

  // Calculate stats for the selected student
  const attendanceStats = useMemo(() => {
    if (!selectedAttendance || !dateRange.from || !dateRange.to) {
      return {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        attendanceRate: 0,
        currentStreak: 0,
        longestStreak: 0,
      };
    }

    const allDatesInRange = getDateArray(
      format(dateRange.from, 'yyyy-MM-dd'),
      format(dateRange.to, 'yyyy-MM-dd')
    ).filter(date => isBefore(parseISO(date), new Date()) || isSameDay(parseISO(date), new Date()));

    const presentDays = allDatesInRange.filter(
      date => selectedAttendance[date] === 'present'
    ).length;
    const absentDays = allDatesInRange.filter(date => selectedAttendance[date] === 'absent').length;
    const totalDays = presentDays + absentDays;
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    // Calculate current streak (from most recent date backwards)
    let currentStreak = 0;
    const sortedDates = allDatesInRange.sort().reverse();
    for (const date of sortedDates) {
      if (selectedAttendance[date] === 'present') {
        currentStreak++;
      } else if (selectedAttendance[date] === 'absent') {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let currentStreakCount = 0;
    for (const date of allDatesInRange.sort()) {
      if (selectedAttendance[date] === 'present') {
        currentStreakCount++;
        longestStreak = Math.max(longestStreak, currentStreakCount);
      } else if (selectedAttendance[date] === 'absent') {
        currentStreakCount = 0;
      }
    }

    return {
      totalDays,
      presentDays,
      absentDays,
      attendanceRate,
      currentStreak,
      longestStreak,
    };
  }, [selectedAttendance, dateRange.from, dateRange.to]);

  // Calendar month state: by default, show the month of the first attendance date, else current month
  const [calendarMonth, setCalendarMonth] = useState<Date | null>(null);

  // Sync calendarMonth with firstAttendanceDate or current month when sidePanel opens or data changes
  useMemo(() => {
    if (sidePanel.open) {
      if (firstAttendanceDate) {
        setCalendarMonth(startOfMonth(parseISO(firstAttendanceDate)));
      } else {
        setCalendarMonth(startOfMonth(new Date()));
      }
    }
  }, [sidePanel.open, firstAttendanceDate]);

  // Dates for the current calendar month
  const calendarMonthStart = calendarMonth ? startOfMonth(calendarMonth) : startOfMonth(new Date());
  const calendarMonthEnd = calendarMonth ? endOfMonth(calendarMonth) : endOfMonth(new Date());
  const calendarDates = getDateArray(
    format(calendarMonthStart, 'yyyy-MM-dd'),
    format(calendarMonthEnd, 'yyyy-MM-dd')
  );

  // For gray background before start date in the month
  const filterStartDate = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null;

  // Calendar grid logic: 7 columns (days of week)
  const weeks: string[][] = [];
  let week: string[] = [];
  calendarDates.forEach(date => {
    const jsDate = new Date(date);
    if (week.length === 0 && jsDate.getDay() !== 0) {
      for (let i = 0; i < jsDate.getDay(); i++) week.push('');
    }
    week.push(date);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });
  if (week.length) {
    while (week.length < 7) week.push('');
    weeks.push(week);
  }

  // Filter config for DynamicTable (date range filter)
  const filterConfig: FilterConfig[] = [
    {
      column: 'dateRange',
      type: 'date-range',
      value: dateRange,
      onChange: (range: { from: Date; to: Date }) => setDateRange(range),
    },
  ];

  // Calendar month navigation with date range restrictions
  const handlePrevMonth = () => {
    const newMonth = calendarMonth ? subMonths(calendarMonth, 1) : subMonths(new Date(), 1);
    // Don't allow navigation before the selected date range
    if (dateRange.from && isBefore(endOfMonth(newMonth), dateRange.from)) {
      return;
    }
    setCalendarMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = calendarMonth ? addMonths(calendarMonth, 1) : addMonths(new Date(), 1);
    // Don't allow navigation after the selected date range
    if (dateRange.to && isAfter(startOfMonth(newMonth), dateRange.to)) {
      return;
    }
    setCalendarMonth(newMonth);
  };

  // Month label
  const monthLabel = format(calendarMonthStart, 'MMMM yyyy');

  return (
    <HelmetWrapper
      title="Attendance | Chatravas"
      heading="Hostel Attendance"
      subHeading="View and filter hostel attendance records."
    >
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Select Institute IDs (comma separated)
          </label>
          <Input
            value={selectedIds.join(',')}
            onChange={e =>
              setSelectedIds(
                e.target.value
                  .split(',')
                  .map(s => s.trim())
                  .filter(Boolean)
              )
            }
            placeholder={allIds.join(',')}
            className="w-full md:w-64"
          />
        </div>
      </div>
      <DynamicTable
        data={getTableData(data ?? {})}
        isLoading={isFetching}
        customRender={customRender}
        tableHeading="Attendance"
        filterConfig={filterConfig}
        disableSearch={true}
      />
      <Sheet
        open={sidePanel.open}
        onOpenChange={open => !open && setSidePanel({ open: false, studentId: null })}
      >
        <SheetTitle style={{ display: 'none' }} />
        <SheetContent side="right" className="w-full md:w-[60%]" style={{ maxWidth: '1200px' }}>
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold text-foreground">Attendance Calendar</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Student ID: {sidePanel.studentId}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-card rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-foreground">
                  {attendanceStats.totalDays}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Total Days</div>
              </div>

              <div className="bg-card rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-success">{attendanceStats.presentDays}</div>
                <div className="text-xs text-muted-foreground mt-1">Present Days</div>
              </div>

              <div className="bg-card rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-destructive">
                  {attendanceStats.absentDays}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Absent Days</div>
              </div>

              <div className="bg-card rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-foreground">
                  {attendanceStats.attendanceRate.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">Attendance Rate</div>
              </div>

              <div className="bg-card rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-foreground">
                  {attendanceStats.currentStreak}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Current Streak</div>
              </div>

              <div className="bg-card rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-foreground">
                  {attendanceStats.longestStreak}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Longest Streak</div>
              </div>
            </div>

            {/* Calendar Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevMonth}
                className="h-8 w-8 p-0"
                aria-label="Previous month"
                disabled={
                  !!dateRange.from &&
                  !!calendarMonth &&
                  isBefore(endOfMonth(subMonths(calendarMonth, 1)), dateRange.from!)
                }
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <path
                    d="M10 12l-4-4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>

              <h3 className="text-base font-medium">{monthLabel}</h3>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextMonth}
                className="h-8 w-8 p-0"
                aria-label="Next month"
                disabled={
                  !!dateRange.to &&
                  !!calendarMonth &&
                  isAfter(startOfMonth(addMonths(calendarMonth, 1)), dateRange.to!)
                }
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <path
                    d="M6 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-2">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div
                    key={day}
                    className="text-xs font-medium text-muted-foreground text-center py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {weeks.flat().map((date, idx) => {
                  if (!date) return <div key={idx} className="h-10" />;

                  const jsDate = new Date(date);
                  const status = selectedAttendance?.[date];

                  // Determine styling based on status and date
                  let cellClass =
                    'h-10 flex items-center justify-center text-sm font-medium rounded-md border transition-colors';

                  // Default state (no data or future dates)
                  if (!status || isAfter(jsDate, new Date())) {
                    cellClass += ' border-border text-muted-foreground';
                  }
                  // Days before filter start date
                  else if (
                    filterStartDate &&
                    isSameDay(startOfMonth(jsDate), calendarMonthStart) &&
                    isBefore(jsDate, dateRange.from!)
                  ) {
                    cellClass += ' border-border text-muted-foreground';
                  }
                  // Present days
                  else if (status === 'present') {
                    cellClass += 'bg-success/20 ring-1 ring-success';
                  }
                  // Absent days
                  else if (status === 'absent') {
                    cellClass += 'bg-destructive/20 ring-1 ring-destructive';
                  }

                  return (
                    <div key={date} className={cellClass}>
                      {parseInt(date.slice(8, 10), 10)}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Legend</h4>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border bg-success/20 ring-1 ring-success"></div>
                  <span>Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border bg-destructive/20 ring-1 ring-destructive"></div>
                  <span>Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border bg-background text-muted-foreground"></div>
                  <span>No data</span>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </HelmetWrapper>
  );
};

export default Attendance;
