import {
  Button,
  HelmetWrapper,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components';
import { useMyStudentCourses, useSlots } from '@/hooks';
import { useTheme } from '@/theme';
import { Calendar, Clock, Filter, Loader2, MapPin } from 'lucide-react';
import { useMemo, useState } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

interface StudentCourse {
  course_id: string;
  course_code: string;
  name: string;
  sem: string;
  slot_room_id: {
    slot_id: string;
    room_id: string[];
  }[];
  instructors: {
    instructor_ldap: string;
    instruction_type: string;
  }[];
}

interface Course {
  course_id: string;
  course_code: string;
  name: string;
  sem: string;
  slot_id: string;
  room_id: string;
  instructors: {
    instructor_ldap: string;
    instruction_type: string;
  }[];
}

interface TimetableCell {
  courses: Course[];
  isMultiPeriod: boolean;
  periodCount: number;
  isFirstPeriod: boolean;
  slot_id: string;
  spanCount?: number; // Number of columns to span
  isSpannedCell?: boolean; // This cell is covered by a spanning card
}

const StudentCourses = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { data: slots = [], isLoading: slotsLoading } = useSlots();
  const { data: studentCoursesData = [], isLoading: coursesLoading } = useMyStudentCourses();
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const processedCourses = useMemo(() => {
    const courses: Course[] = [];

    studentCoursesData.forEach((course: StudentCourse) => {
      course.slot_room_id.forEach(slotRoom => {
        const roomIds = slotRoom.room_id.join(', ');
        courses.push({
          course_id: course.course_id,
          course_code: course.course_code,
          name: course.name,
          sem: course.sem,
          slot_id: slotRoom.slot_id,
          room_id: roomIds,
          instructors: course.instructors || [],
        });
      });
    });

    return courses;
  }, [studentCoursesData]);

  // Get unique semesters for filtering
  const allSemesters = useMemo(() => {
    const semesters = [...new Set(processedCourses.map(course => course.sem))];
    return semesters.sort().reverse(); // Most recent first
  }, [processedCourses]);

  // Set default selected semester to the most recent one if not already set
  useMemo(() => {
    if (allSemesters.length > 0 && !selectedSemester) {
      setSelectedSemester(allSemesters[0]);
    }
  }, [allSemesters, selectedSemester]);

  // Filter courses by selected semester
  const filteredCourses = useMemo(() => {
    if (!selectedSemester) return processedCourses;
    return processedCourses.filter(course => course.sem === selectedSemester);
  }, [processedCourses, selectedSemester]);

  // Group courses by semester
  const semesterCourses = useMemo(() => {
    const semMap: Record<string, Course[]> = {};
    filteredCourses.forEach((course: Course) => {
      if (!semMap[course.sem]) semMap[course.sem] = [];
      semMap[course.sem].push(course);
    });
    return semMap;
  }, [filteredCourses]);

  function parseTimeString(time: string) {
    // Expects time like "09:30AM" or "03:30PM"
    const match = time.match(/(\d{2}):(\d{2})(AM|PM)/);
    if (!match) return 0;

    const [_, hour, minute, period] = match;
    let h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  }
  // Extract start times from time slots
  const getStartTime = (timeRange: string): string => {
    return timeRange.split(' - ')[0];
  };

  // Extract end times from time slots
  const getEndTime = (timeRange: string): string => {
    return timeRange.split(' - ')[1];
  };

  // Break down time ranges into hourly slots
  const breakDownTimeSlots = (timeRanges: string[]): string[] => {
    // Extract all individual start/end times
    const allTimes = new Set<number>();

    timeRanges.forEach(range => {
      const startTime = parseTimeString(getStartTime(range));
      const endTime = parseTimeString(getEndTime(range));

      allTimes.add(startTime);
      allTimes.add(endTime);
    });

    // Sort all times chronologically
    const sortedTimes = Array.from(allTimes).sort((a, b) => a - b);

    // Create hourly slots
    const hourlySlots: string[] = [];
    for (let i = 0; i < sortedTimes.length - 1; i++) {
      const startMinutes = sortedTimes[i];
      const endMinutes = sortedTimes[i + 1];

      const startHour = Math.floor(startMinutes / 60);
      const startMin = startMinutes % 60;
      const startPeriod = startHour < 12 ? 'AM' : 'PM';
      const displayStartHour = startHour === 0 ? 12 : startHour > 12 ? startHour - 12 : startHour;

      const endHour = Math.floor(endMinutes / 60);
      const endMin = endMinutes % 60;
      const endPeriod = endHour < 12 ? 'AM' : 'PM';
      const displayEndHour = endHour === 0 ? 12 : endHour > 12 ? endHour - 12 : endHour;

      const formattedStartTime = `${displayStartHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}${startPeriod}`;
      const formattedEndTime = `${displayEndHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}${endPeriod}`;

      hourlySlots.push(`${formattedStartTime} - ${formattedEndTime}`);
    }

    return hourlySlots;
  };

  // Get unique time slots sorted by actual time (AM/PM aware)
  const timeSlots = useMemo(() => {
    const uniqueTimes = [...new Set(slots.map(slot => slot.time))];
    // Break down multi-period slots into hourly intervals
    const brokenDownSlots = breakDownTimeSlots(uniqueTimes);

    return brokenDownSlots.sort((a, b) => {
      const timeA = parseTimeString(getStartTime(a));
      const timeB = parseTimeString(getStartTime(b));
      return timeA - timeB;
    });
  }, [slots]);

  // Analyze multi-period slots
  const getSlotAnalysis = (_: Course[]) => {
    const slotPeriods: Record<string, { periods: string[]; days: string[] }> = {};

    // Group periods by slot_id
    slots.forEach(slot => {
      if (!slotPeriods[slot.slot_id]) {
        slotPeriods[slot.slot_id] = { periods: [], days: [] };
      }
      if (!slotPeriods[slot.slot_id].periods.includes(slot.time)) {
        slotPeriods[slot.slot_id].periods.push(slot.time);
      }
      if (!slotPeriods[slot.slot_id].days.includes(slot.day)) {
        slotPeriods[slot.slot_id].days.push(slot.day);
      }
    });

    return slotPeriods;
  };

  // Create timetable structure
  const getTimetable = (semCourses: Course[]) => {
    const table: Record<string, Record<string, TimetableCell>> = {};
    const slotAnalysis = getSlotAnalysis(semCourses);

    // Initialize empty timetable
    DAYS.forEach(day => {
      table[day] = {};
      timeSlots.forEach(time => {
        table[day][time] = {
          courses: [],
          isMultiPeriod: false,
          periodCount: 0,
          isFirstPeriod: false,
          slot_id: '',
          spanCount: 1,
          isSpannedCell: false,
        };
      });
    });

    // Fill in courses
    semCourses.forEach(course => {
      const courseSlots = slots.filter(s => s.slot_id === course.slot_id);
      const slotInfo = slotAnalysis[course.slot_id] || { periods: [], days: [] };
      const isMultiPeriod = slotInfo.periods.length > 1;

      courseSlots.forEach(() => {
        if (!courseSlots.some(slot => DAYS.includes(slot.day))) return;

        // Get all time slots that this course spans for each day
        const dayTimeSlots: Record<string, string[]> = {};

        courseSlots.forEach(slot => {
          if (!DAYS.includes(slot.day)) return;

          const slotStartTime = parseTimeString(getStartTime(slot.time));
          const slotEndTime = parseTimeString(getEndTime(slot.time));

          const matchingTimeSlots = timeSlots.filter(timeSlot => {
            const timeSlotStart = parseTimeString(getStartTime(timeSlot));
            const timeSlotEnd = parseTimeString(getEndTime(timeSlot));

            return (
              (timeSlotStart >= slotStartTime && timeSlotStart < slotEndTime) ||
              (timeSlotEnd > slotStartTime && timeSlotEnd <= slotEndTime) ||
              (timeSlotStart <= slotStartTime && timeSlotEnd >= slotEndTime)
            );
          });

          if (!dayTimeSlots[slot.day]) {
            dayTimeSlots[slot.day] = [];
          }
          dayTimeSlots[slot.day].push(...matchingTimeSlots);
        });

        // Remove duplicates and sort for each day
        Object.keys(dayTimeSlots).forEach(day => {
          dayTimeSlots[day] = [...new Set(dayTimeSlots[day])].sort(
            (a, b) => parseTimeString(getStartTime(a)) - parseTimeString(getStartTime(b))
          );
        });

        // Place courses in the table
        Object.entries(dayTimeSlots).forEach(([day, timeSlotList]) => {
          if (isMultiPeriod && timeSlotList.length > 1) {
            // For multi-period courses, place only in the first time slot
            const firstTimeSlot = timeSlotList[0];
            const cell = table[day][firstTimeSlot];

            if (!cell.courses.some(c => c.course_id === course.course_id)) {
              cell.courses.push(course);
            }

            cell.isMultiPeriod = true;
            cell.periodCount = timeSlotList.length;
            cell.isFirstPeriod = true;
            cell.slot_id = course.slot_id;
            cell.spanCount = timeSlotList.length; // Number of columns to span

            // Mark other time slots as spanned (but don't put course in them)
            for (let i = 1; i < timeSlotList.length; i++) {
              const spannedCell = table[day][timeSlotList[i]];
              spannedCell.isSpannedCell = true;
              spannedCell.slot_id = course.slot_id;
            }
          } else {
            // Regular single-period course
            timeSlotList.forEach(timeSlot => {
              const cell = table[day][timeSlot];

              if (!cell.courses.some(c => c.course_id === course.course_id)) {
                cell.courses.push(course);
              }

              cell.isMultiPeriod = false;
              cell.periodCount = 1;
              cell.isFirstPeriod = true;
              cell.slot_id = course.slot_id;
              cell.spanCount = 1;
            });
          }
        });
      });
    });

    return table;
  };

  const renderCourseCard = (
    course: Course,
    isMultiple: boolean,
    isMultiPeriod: boolean,
    spanCount: number = 1
  ) => {
    // Calculate width based on span count
    const spanWidth =
      spanCount > 1 ? `calc(${spanCount * 100}% + ${(spanCount - 1) * 0}px)` : '100%';

    // Theme-aware styling with more vibrant colors
    const cardClass = `rounded-lg p-3 transition-all duration-200 hover:shadow-md relative ${
      isDark
        ? isMultiPeriod
          ? 'bg-gradient-to-r from-pink-900/50 to-pink-800/40 border-2 border-pink-700/50 hover:from-pink-800/60 hover:to-pink-700/50'
          : 'bg-gradient-to-r from-blue-900/50 to-blue-800/40 border-2 border-blue-700/50 hover:from-blue-800/60 hover:to-blue-700/50'
        : isMultiPeriod
          ? 'bg-gradient-to-r from-purple-100 to-purple-200 border-2 border-purple-300 hover:from-purple-200 hover:to-purple-300'
          : 'bg-gradient-to-r from-blue-100 to-blue-200 border-2 border-blue-300 hover:from-blue-200 hover:to-blue-300'
    } ${isMultiple ? 'mb-2 last:mb-0' : ''}`;

    const codeClassLight = isMultiPeriod ? 'text-purple-800' : 'text-blue-800';
    const codeClassDark = isMultiPeriod ? 'text-pink-200' : 'text-blue-200';

    const roomChipClassLight = isMultiPeriod
      ? 'bg-emerald-200 text-emerald-800 border-emerald-300'
      : 'bg-amber-200 text-amber-800 border-amber-300';
    const roomChipClassDark = isMultiPeriod
      ? 'bg-emerald-900/40 text-emerald-300 border-emerald-800/40'
      : 'bg-amber-900/40 text-amber-300 border-amber-800/40';

    const instructionChipClassLight = 'bg-gray-200 text-gray-800 border-gray-300';
    const instructionChipClassDark = 'bg-gray-800 text-gray-200 border-gray-700';

    const rooms = course.room_id ? course.room_id.split(', ') : [];
    const instructionType =
      course.instructors && course.instructors.length > 0
        ? course.instructors[0].instruction_type
        : '';

    return (
      <div
        key={course.course_id}
        className={cardClass}
        style={{
          width: spanWidth,
          minWidth: spanCount > 1 ? `${spanCount * 200}px` : 'auto', // Ensure minimum width
          zIndex: isMultiPeriod ? 10 : 'auto', // Higher z-index for spanning cards
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className={`font-bold text-sm ${isDark ? codeClassDark : codeClassLight}`}>
            {course.course_code}
          </div>

          {/* Show span indicator for multi-period courses */}
          {isMultiPeriod && spanCount > 1 && (
            <span
              className={`text-xs px-2 py-1 rounded-full font-semibold border ${isDark ? 'bg-pink-900/60 text-pink-200 border-pink-700' : 'bg-purple-200 text-purple-800 border-purple-400'}`}
            >
              Spans {spanCount} periods
            </span>
          )}

          {/* Instruction type badge */}
          {instructionType && (
            <span
              className={`text-xs px-2 py-1 rounded-full font-semibold border ${isDark ? instructionChipClassDark : instructionChipClassLight}`}
            >
              {instructionType}
            </span>
          )}
        </div>

        <div
          className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-3 line-clamp-2 leading-relaxed`}
        >
          {course.name}
        </div>

        <div className="space-y-2">
          {/* Multi-period indicator */}
          {isMultiPeriod && (
            <div className="flex items-center">
              <Clock className={`w-3 h-3 mr-1 ${isDark ? 'text-pink-300' : 'text-purple-700'}`} />
              <span
                className={`text-xs font-medium ${isDark ? 'text-pink-300' : 'text-purple-700'}`}
              >
                Extended Duration Course
              </span>
            </div>
          )}

          {/* Room chips */}
          <div className="flex flex-wrap items-center gap-1">
            <MapPin
              className={`w-3 h-3 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            />
            <div className="flex flex-wrap gap-1">
              {rooms.length > 0 ? (
                rooms.map((room, index) => (
                  <span
                    key={`${room}-${index}`}
                    className={`text-xs px-2 py-0.5 rounded-full font-mono border ${isDark ? roomChipClassDark : roomChipClassLight}`}
                  >
                    {room.trim()}
                  </span>
                ))
              ) : (
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No room assigned
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  const renderTimeSlotCell = (day: string, time: string, cell: TimetableCell) => {
    const hasCourses = cell.courses.length > 0;
    const hasMultipleCourses = cell.courses.length > 1;

    // If this cell is spanned by another card, show empty or placeholder
    if (cell.isSpannedCell) {
      return (
        <div
          className={`text-center ${isDark ? 'text-gray-600' : 'text-gray-300'} text-xs py-4 opacity-50`}
        >
          <div>←</div>
          <div className="text-xs">Spanned</div>
        </div>
      );
    }

    if (!hasCourses) {
      return (
        <div className={`text-center ${isDark ? 'text-gray-500' : 'text-gray-400'} text-sm py-8`}>
          <Clock className="w-4 h-4 mx-auto mb-1 opacity-50" />
          <div>Free</div>
        </div>
      );
    }

    const multiCourseBgLight = 'bg-amber-200 border border-amber-400';
    const multiCourseBgDark = 'bg-amber-800/50 border border-amber-700/50';

    return (
      <div className="space-y-0 relative">
        {hasMultipleCourses && (
          <div
            className={`rounded-md px-2 py-1 mb-2 ${isDark ? multiCourseBgDark : multiCourseBgLight}`}
          >
            <div
              className={`text-xs font-semibold ${isDark ? 'text-amber-300' : 'text-amber-800'} flex items-center`}
            >
              <span
                className={`w-2 h-2 ${isDark ? 'bg-amber-400' : 'bg-amber-500'} rounded-full mr-2`}
              ></span>
              {cell.courses.length} Courses Scheduled
            </div>
          </div>
        )}

        {cell.courses.map(course =>
          renderCourseCard(course, hasMultipleCourses, cell.isMultiPeriod, cell.spanCount || 1)
        )}
      </div>
    );
  };

  if (slotsLoading || coursesLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  const tableContainerStyle = {
    position: 'relative',
    overflow: 'visible', // Allow cards to overflow table boundaries
  };
  return (
    <HelmetWrapper
      title="My Courses | Seamless"
      heading="My Courses"
      subHeading="Visualise your course schedule and timetable"
    >
      {/* Semester filter */}
      <div
        className={`flex flex-wrap items-center gap-4 mb-8 p-4 rounded-lg ${isDark ? 'bg-card/50' : 'bg-gray-50'} border border-border`}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Select Semester:
          </span>
        </div>
        <div className="flex-1 max-w-xs">
          <Select value={selectedSemester || ''} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a semester" />
            </SelectTrigger>
            <SelectContent>
              {allSemesters.map(sem => (
                <SelectItem key={sem} value={sem}>
                  {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedSemester && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setSelectedSemester(null)}
          >
            <Filter className="h-3 w-3" /> Show All Semesters
          </Button>
        )}
      </div>

      <div className="space-y-10">
        {Object.entries(semesterCourses).map(([sem, semCourses]) => {
          const timetable = getTimetable(semCourses);

          return (
            <div key={sem} className="mb-8">
              <h2
                className={`text-2xl font-bold mb-6 ${isDark ? 'text-gray-100' : 'text-gray-800'} border-l-4 ${isDark ? 'border-pink-500' : 'border-blue-500'} pl-4`}
              >
                Semester {sem}
              </h2>

              <div className="overflow-x-auto shadow-lg rounded-lg">
                <table className={`min-w-full ${isDark ? 'bg-card' : 'bg-white'}`}>
                  <thead>
                    <tr
                      className={`${isDark ? 'bg-gradient-to-r from-pink-900 to-pink-800' : 'bg-gradient-to-r from-blue-600 to-blue-700'} text-white`}
                    >
                      <th
                        className={`px-4 py-4 text-left font-semibold border ${isDark ? 'border-pink-800/50' : 'border-blue-500'}`}
                      >
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>Day / Time</span>
                        </div>
                      </th>
                      {timeSlots.map(time => (
                        <th
                          key={time}
                          className={`px-4 py-4 text-center font-semibold border ${isDark ? 'border-pink-800/50' : 'border-blue-500'} min-w-[200px]`}
                        >
                          <div className="font-bold text-sm">{time}</div>
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
                            ? isDark
                              ? 'bg-muted/30'
                              : 'bg-gray-25'
                            : isDark
                              ? 'bg-card'
                              : 'bg-white'
                        }
                      >
                        <td
                          className={`px-4 py-4 font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'} border ${isDark ? 'border-border' : 'border-gray-300'} ${isDark ? 'bg-gradient-to-r from-muted to-card/80' : 'bg-gradient-to-r from-gray-100 to-gray-50'}`}
                        >
                          <div className="text-center">
                            <div className="font-bold">{day}</div>
                          </div>
                        </td>
                        {timeSlots.map(time => {
                          const cell = timetable[day][time];

                          return (
                            <td
                              key={`${day}-${time}`}
                              className={`px-2 py-2 border ${isDark ? 'border-border' : 'border-gray-300'} align-top`}
                            >
                              {renderTimeSlotCell(day, time, cell)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend and Statistics */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Legend */}{' '}
                <div className={`rounded-lg p-4 ${isDark ? 'bg-card/50' : 'bg-gray-50'}`}>
                  <h3
                    className={`font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}
                  >
                    Legend
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-4 h-4 rounded ${
                          isDark
                            ? 'bg-blue-900/50 border-2 border-blue-700/50'
                            : 'bg-blue-100 border-2 border-blue-300'
                        }`}
                      ></div>
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Regular Course
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-4 h-4 rounded ${
                          isDark
                            ? 'bg-pink-900/50 border-2 border-pink-700/50'
                            : 'bg-purple-200 border-2 border-purple-300'
                        }`}
                      ></div>
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Course Spanning Multiple Time Slots
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-4 h-4 rounded ${
                          isDark
                            ? 'bg-amber-800/50 border-2 border-amber-700/50'
                            : 'bg-amber-200 border-2 border-amber-400'
                        }`}
                      ></div>
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Multiple Courses in Same Slot
                      </span>
                    </div>
                  </div>
                </div>
                {/* Course Summary */}
                <div className={`rounded-lg p-4 ${isDark ? 'bg-card/50' : 'bg-gray-50'}`}>
                  <h3
                    className={`font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}
                  >
                    Course Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Courses:
                      </span>
                      <span className="font-semibold">{semCourses.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Multi-Period Courses:
                      </span>
                      <span className="font-semibold">
                        {
                          semCourses.filter(course => {
                            const courseSlots = slots.filter(s => s.slot_id === course.slot_id);
                            return courseSlots.length > 1;
                          }).length
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {Object.keys(semesterCourses).length === 0 && (
          <div
            className={`text-center py-12 rounded-lg border ${isDark ? 'border-border bg-card/50' : 'border-gray-200 bg-gray-50'}`}
          >
            <Clock
              className={`w-16 h-16 ${isDark ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`}
            />
            <div className={`${isDark ? 'text-gray-300' : 'text-gray-500'} text-lg`}>
              No courses found
            </div>
            <div className={`${isDark ? 'text-gray-400' : 'text-gray-400'} text-sm mt-2`}>
              {selectedSemester
                ? `No courses found for semester ${selectedSemester}`
                : "You haven't enrolled in any courses yet."}
            </div>
          </div>
        )}
      </div>
    </HelmetWrapper>
  );
};

export default StudentCourses;
