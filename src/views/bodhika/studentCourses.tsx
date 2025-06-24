import { useMemo, useState } from 'react';
import { Loader2, Clock, MapPin, User } from 'lucide-react';
import { useSlots, useMyStudentCourses } from '@/hooks';
import { HelmetWrapper } from '@/components/HelmetWrapper';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  ScrollArea,
  Checkbox,
} from '@/components';
import { ChevronDownIcon } from 'lucide-react';

// Enhanced mock slots with various durations
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  '08:30 - 09:25',
  '09:30 - 10:25',
  '10:30 - 11:25',
  '11:30 - 12:25',
  '12:30 - 01:25',
  '02:30 - 03:25',
  '03:30 - 04:25',
  '04:30 - 05:25',
];

interface Course {
  course_id: string;
  course_code: string;
  name: string;
  sem: string;
  slot_room_id: { slot_id: string; room_id: string[] }[];
  instructors: { instructor_ldap: string; instruction_type: string }[];
  students?: any;
}

interface TimetableCell {
  courses: {
    course: Course;
    slot_id: string;
    rooms: string[];
    duration: number;
  }[];
  colspan: number;
  isSkip: boolean;
}

const StudentCourses = () => {
  const { data: slots = [], isFetching: slotsLoading } = useSlots();
  const { data: courses = [], isFetching: coursesLoading } = useMyStudentCourses();

  // Enhanced time parsing with better duration calculation
  const parseTimeToMinutes = (time: string): number => {
    const match = time.match(/^(\d{1,2}):(\d{2})(AM|PM)?$/i);
    if (!match) return NaN;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3]?.toUpperCase();

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  // Smart colspan calculation based on actual duration
  const getSlotColspan = (timeRange: string): number => {
    const [start, end] = timeRange.split(' - ');
    const startMinutes = parseTimeToMinutes(start);
    const endMinutes = parseTimeToMinutes(end);
    const duration = endMinutes - startMinutes;

    // Each standard slot is 55 minutes, so calculate how many slots this spans
    const standardSlotDuration = 55;
    return Math.max(1, Math.ceil(duration / standardSlotDuration));
  };

  // Get duration in hours for display
  const getDurationInHours = (timeRange: string): number => {
    const [start, end] = timeRange.split(' - ');
    const startMinutes = parseTimeToMinutes(start);
    const endMinutes = parseTimeToMinutes(end);
    return (endMinutes - startMinutes) / 60;
  };

  // Build enhanced slot mapping
  const slotDayTimeMap = useMemo(() => {
    const map: Record<string, { day: string; time: string; duration: number; colspan: number }> =
      {};
    slots.forEach((slot: any) => {
      const colspan = getSlotColspan(slot.time);
      const duration = getDurationInHours(slot.time);
      map[slot.slot_id] = {
        day: slot.day,
        time: slot.time,
        duration,
        colspan,
      };
    });
    return map;
  }, [slots]);

  // Group courses by semester
  const semesterCourses = useMemo(() => {
    const semMap: Record<string, Course[]> = {};
    courses.forEach((course: Course) => {
      if (!semMap[course.sem]) semMap[course.sem] = [];
      semMap[course.sem].push(course);
    });
    return semMap;
  }, [courses]);

  // Get all semesters for filter dropdown
  const semesterList = useMemo(() => Object.keys(semesterCourses), [semesterCourses]);
  const [selectedSemester, setSelectedSemester] = useState<string>(semesterList[0] || '');

  // Update selectedSemester when semesterList changes
  // (prevents stale state if data loads after mount)
  useMemo(() => {
    if (semesterList.length && !semesterList.includes(selectedSemester)) {
      setSelectedSemester(semesterList[0]);
    }
  }, [semesterList, selectedSemester]);

  // Find the best matching time slot for a given time
  const findBestTimeSlot = (targetTime: string): string | null => {
    // First try exact match
    if (TIME_SLOTS.includes(targetTime)) {
      return targetTime;
    }

    // Try to find the best starting slot based on start time
    const [targetStart] = targetTime.split(' - ');
    const targetStartMinutes = parseTimeToMinutes(targetStart);

    let bestMatch = null;
    let bestDiff = Infinity;

    for (const slot of TIME_SLOTS) {
      const [slotStart] = slot.split(' - ');
      const slotStartMinutes = parseTimeToMinutes(slotStart);
      const diff = Math.abs(targetStartMinutes - slotStartMinutes);

      if (diff < bestDiff) {
        bestDiff = diff;
        bestMatch = slot;
      }
    }

    return bestMatch;
  };

  // Enhanced timetable creation with automatic colspan handling
  const getTimetable = (semCourses: Course[]) => {
    const table: Record<string, Record<string, TimetableCell>> = {};

    // Initialize empty table
    DAYS.forEach(day => {
      table[day] = {};
      TIME_SLOTS.forEach(time => {
        table[day][time] = {
          courses: [],
          colspan: 1,
          isSkip: false,
        };
      });
    });

    // Fill table with courses
    semCourses.forEach(course => {
      course.slot_room_id.forEach(slotRoom => {
        const { slot_id, room_id } = slotRoom;
        const slotInfo = slotDayTimeMap[slot_id];
        if (!slotInfo) return;

        const { day, time, duration, colspan } = slotInfo;

        // Find the best matching time slot
        const matchingTimeSlot = findBestTimeSlot(time);
        if (!matchingTimeSlot) return;

        const cell = table[day]?.[matchingTimeSlot];
        if (!cell) return;

        // Add course to the starting cell
        cell.courses.push({
          course,
          slot_id,
          rooms: room_id,
          duration,
        });
        cell.colspan = colspan;

        // Mark subsequent cells as skip if this spans multiple slots
        if (colspan > 1) {
          const currentTimeIndex = TIME_SLOTS.indexOf(matchingTimeSlot);
          for (let i = 1; i < colspan; i++) {
            const nextTimeIndex = currentTimeIndex + i;
            if (nextTimeIndex < TIME_SLOTS.length) {
              const nextTime = TIME_SLOTS[nextTimeIndex];
              if (table[day][nextTime]) {
                table[day][nextTime].isSkip = true;
              }
            }
          }
        }
      });
    });

    return table;
  };

  // Enhanced color scheme with dark mode support
  const getSlotTypeColor = (duration: number) => {
    if (duration >= 3) {
      // Long sessions (3+ hours) - Labs, Projects
      return {
        bg: 'bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 dark:from-pink-900/20 dark:via-pink-800/30 dark:to-rose-900/20',
        border: 'border-blue-300 dark:border-pink-500/50',
        text: 'text-blue-900 dark:text-pink-100',
        hover:
          'hover:from-blue-100 hover:via-blue-150 hover:to-indigo-100 dark:hover:from-pink-800/40 dark:hover:via-pink-700/50 dark:hover:to-rose-800/40',
        badge: 'bg-blue-200 text-blue-900 dark:bg-pink-700/50 dark:text-pink-100',
        accent: 'bg-blue-500 dark:bg-pink-500',
        label: 'Lab',
      };
    } else if (duration >= 1.5) {
      // Medium sessions (1.5-3 hours) - Workshops, Tutorials
      return {
        bg: 'bg-gradient-to-br from-sky-50 via-blue-100 to-cyan-50 dark:from-rose-900/20 dark:via-pink-800/30 dark:to-fuchsia-900/20',
        border: 'border-sky-300 dark:border-rose-500/50',
        text: 'text-sky-900 dark:text-rose-100',
        hover:
          'hover:from-sky-100 hover:via-blue-150 hover:to-cyan-100 dark:hover:from-rose-800/40 dark:hover:via-pink-700/50 dark:hover:to-fuchsia-800/40',
        badge: 'bg-sky-200 text-sky-900 dark:bg-rose-700/50 dark:text-rose-100',
        accent: 'bg-sky-500 dark:bg-rose-500',
        label: 'Tutorial',
      };
    } else {
      // Standard sessions (1 hour) - Regular lectures
      return {
        bg: 'bg-gradient-to-br from-indigo-50 via-blue-100 to-blue-50 dark:from-fuchsia-900/20 dark:via-pink-800/30 dark:to-pink-900/20',
        border: 'border-indigo-300 dark:border-fuchsia-500/50',
        text: 'text-indigo-900 dark:text-fuchsia-100',
        hover:
          'hover:from-indigo-100 hover:via-blue-150 hover:to-blue-100 dark:hover:from-fuchsia-800/40 dark:hover:via-pink-700/50 dark:hover:to-pink-800/40',
        badge: 'bg-indigo-200 text-indigo-900 dark:bg-fuchsia-700/50 dark:text-fuchsia-100',
        accent: 'bg-indigo-500 dark:bg-fuchsia-500',
        label: 'Lecture',
      };
    }
  };

  const renderCourseCard = (
    course: Course,
    slot_id: string,
    rooms: string[],
    duration: number,
    isMultiple: boolean
  ) => {
    const colors = getSlotTypeColor(duration);
    const cardClass = `rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${colors.bg} border-2 ${colors.border} ${colors.hover} ${isMultiple ? 'mb-3 last:mb-0' : ''}`;

    return (
      <div key={course.course_id + slot_id} className={cardClass}>
        {/* Header with course code and duration */}
        <div className="flex items-center justify-between mb-3">
          <div className={`font-bold text-lg ${colors.text}`}>{course.course_code}</div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                  {colors.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={`text-sm font-medium mb-3 line-clamp-2 leading-relaxed ${colors.text}`}>
          {course.name}
        </div>

        {/* Details row */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            <span className={`px-2 py-1 rounded-full font-mono ${colors.badge}`}>
              {rooms.join(', ')}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderTimeSlotCell = (day: string, time: string, cell: TimetableCell) => {
    if (cell.isSkip) return null;

    const hasCourses = cell.courses.length > 0;
    const hasMultipleCourses = cell.courses.length > 1;

    if (!hasCourses) {
      return (
        <td
          key={`${day}-${time}`}
          className="px-3 py-3 border border-gray-300 dark:border-gray-600 align-top bg-gray-50 dark:bg-gray-800/50"
          colSpan={cell.colspan}
        >
          <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
            <Clock className="w-5 h-5 mx-auto mb-2 opacity-50" />
            <div className="font-medium">Free Period</div>
            <div className="text-xs mt-1 opacity-75">Available</div>
          </div>
        </td>
      );
    }

    return (
      <td
        key={`${day}-${time}`}
        className="px-3 py-3 border border-gray-300 dark:border-gray-600 align-top bg-white dark:bg-gray-900"
        colSpan={cell.colspan}
      >
        <div className="space-y-0">
          {hasMultipleCourses && (
            <div className="bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-300 dark:border-amber-600/50 rounded-lg px-3 py-2 mb-3">
              <div className="text-xs font-bold text-amber-900 dark:text-amber-100 flex items-center">
                <span className="w-2 h-2 bg-amber-600 dark:bg-amber-400 rounded-full mr-2 animate-pulse"></span>
                {cell.courses.length} Concurrent Courses
              </div>
            </div>
          )}
          {cell.courses.map(({ course, slot_id, rooms, duration }) =>
            renderCourseCard(course, slot_id, rooms, duration, hasMultipleCourses)
          )}
        </div>
      </td>
    );
  };

  if (slotsLoading || coursesLoading) {
    return (
      <HelmetWrapper
        title="My Timetable"
        heading="My Timetable"
        subHeading="Comprehensive view of your semester schedule with smart multi-period slot handling"
      >
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin h-8 w-8 text-gray-500 dark:text-gray-400" />
        </div>
      </HelmetWrapper>
    );
  }

  return (
    <HelmetWrapper
      title="My Timetable"
      heading="My Timetable"
      subHeading="Comprehensive view of your semester schedule"
    >
      <div className="space-y-12">
        {selectedSemester &&
          semesterCourses[selectedSemester] &&
          (() => {
            const timetable = getTimetable(semesterCourses[selectedSemester]);
            return (
              <div key={selectedSemester} className="mb-10">
                <div className="flex justify-start mb-8">
                  {semesterList.length > 1 && (
                    <div className="flex items-center gap-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full sm:min-w-[160px] lg:min-w-[180px] flex justify-between items-center h-10 sm:h-11 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <span className="truncate">
                              {selectedSemester
                                ? `Semester ${selectedSemester}`
                                : 'Select Semester'}
                            </span>
                            <ChevronDownIcon className="ml-2 h-4 w-4 flex-shrink-0" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                          <ScrollArea className="min-h-16">
                            {semesterList.map(sem => (
                              <div
                                key={sem}
                                className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                                onClick={() =>
                                  setSelectedSemester(sem === selectedSemester ? '' : sem)
                                }
                              >
                                <Checkbox
                                  checked={selectedSemester === sem}
                                  onCheckedChange={() =>
                                    setSelectedSemester(sem === selectedSemester ? '' : sem)
                                  }
                                  className="mr-2"
                                  tabIndex={-1}
                                  aria-label={`Semester ${sem}`}
                                />
                                <span className="text-sm">{`Semester ${sem}`}</span>
                              </div>
                            ))}
                          </ScrollArea>
                          {selectedSemester && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 w-full text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => setSelectedSemester('')}
                            >
                              Clear
                            </Button>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>

                <div className="relative flex">
                  {/* Vertical Semester Title Flag */}
                  <div className="relative mr-4">
                    <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-b from-blue-700 via-blue-800 to-blue-900 dark:from-pink-700 dark:via-pink-800 dark:to-rose-900 rounded-l-xl shadow-lg">
                      <div className="h-full flex items-center justify-center">
                        <div className="transform -rotate-90 whitespace-nowrap">
                          <h2 className="text-2xl font-bold text-white tracking-wider">
                            SEMESTER {selectedSemester}
                          </h2>
                        </div>
                      </div>
                    </div>
                    {/* Flag triangle */}
                    <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 w-0 h-0 border-l-[20px] border-l-blue-900 dark:border-l-rose-900 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent"></div>
                  </div>

                  {/* Timetable */}
                  <div className="flex-1 overflow-x-auto shadow-2xl rounded-r-xl bg-white dark:bg-gray-900 ml-12">
                    <table className="min-w-full relative">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 dark:from-pink-700 dark:via-pink-800 dark:to-rose-900 text-white">
                          <th className="sticky left-0 z-10 px-6 py-5 text-left font-bold border border-blue-600 dark:border-pink-600 bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 dark:from-pink-700 dark:via-pink-800 dark:to-rose-900">
                            <div className="flex items-center space-x-3">
                              <Clock className="w-5 h-5" />
                              <span className="text-lg">Day / Time</span>
                            </div>
                          </th>
                          {TIME_SLOTS.map(time => (
                            <th
                              key={time}
                              className="px-4 py-5 text-center font-bold border border-blue-600 dark:border-pink-600 min-w-[220px]"
                            >
                              <div className="text-sm leading-tight">{time}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {DAYS.map((day, dayIndex) => (
                          <tr
                            key={day}
                            className={
                              dayIndex % 2 === 0
                                ? 'bg-gray-50 dark:bg-gray-800/50'
                                : 'bg-white dark:bg-gray-900'
                            }
                          >
                            <td className="sticky left-0 z-10 px-6 py-6 font-bold text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 bg-gradient-to-r from-gray-100 via-gray-50 to-white dark:from-gray-700 dark:via-gray-800 dark:to-gray-900">
                              <div className="text-center">
                                <div className="text-lg font-bold">{day}</div>
                              </div>
                            </td>
                            {TIME_SLOTS.map(time => {
                              const cell = timetable[day][time];
                              return renderTimeSlotCell(day, time, cell);
                            }).filter(Boolean)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

        {semesterList.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <Clock className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
            <div className="text-gray-500 dark:text-gray-400 text-xl font-semibold">
              No courses found
            </div>
            <div className="text-gray-400 dark:text-gray-500 text-base mt-3">
              You haven't enrolled in any courses yet.
            </div>
          </div>
        )}
      </div>
    </HelmetWrapper>
  );
};

export default StudentCourses;
