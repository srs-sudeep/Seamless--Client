import React, { useMemo } from 'react';
import { Loader2, Clock, MapPin, User } from 'lucide-react';
import { useSlots } from '@/hooks/bodhika/useSlots.hook';

// Mock data with multi-period slots and multiple courses per slot
const mockSlots = [
  // Regular single-period slots
  { time: '08:30AM - 09:25AM', day: 'Monday', slot_id: 'A1' },
  { time: '09:30AM - 10:25AM', day: 'Wednesday', slot_id: 'A2' },
  { time: '09:30AM - 10:25AM', day: 'Monday', slot_id: 'B1' },
  { time: '09:30AM - 10:25AM', day: 'Tuesday', slot_id: 'B2' },

  // Multi-period slots (like N in your image that spans 3 periods)
  { time: '11:30AM - 12:25PM', day: 'Monday', slot_id: 'N1', duration: 1 },
  { time: '12:30PM - 01:25PM', day: 'Monday', slot_id: 'N1', duration: 1 },
  { time: '02:30PM - 03:25PM', day: 'Monday', slot_id: 'N1', duration: 1 },

  { time: '10:30AM - 11:25AM', day: 'Tuesday', slot_id: 'V1', duration: 1 },
  { time: '11:30AM - 12:25PM', day: 'Tuesday', slot_id: 'V1', duration: 1 },

  // More regular slots
  { time: '10:30AM - 11:25AM', day: 'Monday', slot_id: 'C1' },
  { time: '11:30AM - 12:25PM', day: 'Tuesday', slot_id: 'C2' },
  { time: '12:30PM - 01:25PM', day: 'Wednesday', slot_id: 'D1' },
  { time: '02:30PM - 03:25PM', day: 'Thursday', slot_id: 'E1' },
  { time: '03:30PM - 04:25PM', day: 'Friday', slot_id: 'F1' },
];

const mockCourses = [
  {
    course_id: 'CSL251-2024-25W',
    course_code: 'CSL251',
    name: 'Computer Organisation and Architecture',
    sem: '2024-25W',
    slot_id: 'A2',
    room_id: 'LHCL102',
    instructors: [{ instructor_ldap: 'prof1', instruction_type: 'Lecture' }],
  },
  // Multiple courses in same slot
  {
    course_id: 'CSL252-2024-25W',
    course_code: 'CSL252',
    name: 'Data Structures Lab',
    sem: '2024-25W',
    slot_id: 'A2',
    room_id: 'LAB1',
    instructors: [{ instructor_ldap: 'prof2', instruction_type: 'Lab' }],
  },
  // Multi-period course
  {
    course_id: 'CSL253-2024-25W',
    course_code: 'CSL253',
    name: 'Software Engineering Project',
    sem: '2024-25W',
    slot_id: 'N1',
    room_id: 'LH201',
    instructors: [{ instructor_ldap: 'prof3', instruction_type: 'Project' }],
  },
  {
    course_id: 'CSL254-2024-25W',
    course_code: 'CSL254',
    name: 'Advanced Database Systems',
    sem: '2024-25W',
    slot_id: 'V1',
    room_id: 'LH301',
    instructors: [{ instructor_ldap: 'prof4', instruction_type: 'Lecture' }],
  },
  {
    course_id: 'CSL255-2024-25W',
    course_code: 'CSL255',
    name: 'Algorithms Analysis',
    sem: '2024-25W',
    slot_id: 'C1',
    room_id: 'LH101',
    instructors: [{ instructor_ldap: 'prof5', instruction_type: 'Lecture' }],
  },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

interface Course {
  course_id: string;
  course_code: string;
  name: string;
  sem: string;
  slot_id: string;
  room_id: string;
  instructors: { instructor_ldap: string; instruction_type: string }[];
}

interface Slot {
  time: string;
  day: string;
  slot_id: string;
  duration?: number;
}

interface TimetableCell {
  courses: Course[];
  isMultiPeriod: boolean;
  periodCount: number;
  isFirstPeriod: boolean;
  slot_id: string;
}

const StudentCourses = () => {
  const { data: slots = [], isLoading: slotsLoading } = useSlots();
  const courses = mockCourses;
  const coursesLoading = false;

  // Group courses by semester
  const semesterCourses = useMemo(() => {
    const semMap: Record<string, Course[]> = {};
    courses.forEach((course: Course) => {
      if (!semMap[course.sem]) semMap[course.sem] = [];
      semMap[course.sem].push(course);
    });
    return semMap;
  }, [courses]);
  function parseTimeString(time: string) {
    // Expects time like "09:30AM" or "03:30PM"
    const [_, hour, minute, period] = time.match(/(\d{2}):(\d{2})(AM|PM)/) || [];
    let h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  }

  // Get unique time slots sorted by actual time (AM/PM aware)
  const timeSlots = useMemo(() => {
    const uniqueTimes = [...new Set(slots.map(slot => slot.time))];
    return uniqueTimes.sort((a, b) => {
      const timeA = parseTimeString(a.split(' - ')[0]);
      const timeB = parseTimeString(b.split(' - ')[0]);
      return timeA - timeB;
    });
  }, [slots]);

  // Analyze multi-period slots
  const getSlotAnalysis = (semCourses: Course[]) => {
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
        };
      });
    });

    // Fill in courses
    semCourses.forEach(course => {
      const courseSlots = slots.filter(s => s.slot_id === course.slot_id);
      const slotInfo = slotAnalysis[course.slot_id];
      const isMultiPeriod = slotInfo.periods.length > 1;

      courseSlots.forEach((slot, index) => {
        if (DAYS.includes(slot.day)) {
          const cell = table[slot.day][slot.time];
          cell.courses.push(course);
          cell.isMultiPeriod = isMultiPeriod;
          cell.periodCount = slotInfo.periods.length;
          cell.isFirstPeriod = index === 0;
          cell.slot_id = course.slot_id;
        }
      });
    });

    return table;
  };

  const renderCourseCard = (course: Course, isMultiple: boolean, isMultiPeriod: boolean) => {
    const cardClass = `rounded-lg p-3 transition-all duration-200 hover:shadow-md ${
      isMultiPeriod
        ? 'bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 hover:from-purple-100 hover:to-purple-150'
        : 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 hover:from-blue-100 hover:to-blue-150'
    } ${isMultiple ? 'mb-2 last:mb-0' : ''}`;

    return (
      <div key={course.course_id} className={cardClass}>
        <div className="flex items-center justify-between mb-2">
          <div
            className={`font-bold text-sm ${isMultiPeriod ? 'text-purple-800' : 'text-blue-800'}`}
          >
            {course.course_code}
          </div>
          {isMultiPeriod && (
            <span className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full font-semibold">
              Multi-Period
            </span>
          )}
        </div>

        <div className="text-xs text-gray-700 mb-3 line-clamp-2 leading-relaxed">{course.name}</div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-gray-500" />
              <span
                className={`text-xs px-2 py-1 rounded-full font-mono ${
                  isMultiPeriod ? 'bg-purple-200 text-purple-800' : 'bg-blue-200 text-blue-800'
                }`}
              >
                {course.room_id}
              </span>
            </div>

            {course.instructors && course.instructors.length > 0 && (
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-600">
                  {course.instructors[0].instruction_type}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTimeSlotCell = (day: string, time: string, cell: TimetableCell) => {
    const hasCourses = cell.courses.length > 0;
    const hasMultipleCourses = cell.courses.length > 1;

    if (!hasCourses) {
      return (
        <div className="text-center text-gray-400 text-sm py-8">
          <Clock className="w-4 h-4 mx-auto mb-1 opacity-50" />
          <div>Free</div>
        </div>
      );
    }

    return (
      <div className="space-y-0">
        {hasMultipleCourses && (
          <div className="bg-amber-100 border border-amber-300 rounded-md px-2 py-1 mb-2">
            <div className="text-xs font-semibold text-amber-800 flex items-center">
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
              {cell.courses.length} Courses Scheduled
            </div>
          </div>
        )}

        {cell.isMultiPeriod && cell.isFirstPeriod && (
          <div className="bg-purple-100 border border-purple-300 rounded-md px-2 py-1 mb-2">
            <div className="text-xs font-semibold text-purple-800 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Spans {cell.periodCount} Periods
            </div>
          </div>
        )}

        {cell.courses.map(course =>
          renderCourseCard(course, hasMultipleCourses, cell.isMultiPeriod)
        )}
      </div>
    );
  };

  if (slotsLoading || coursesLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Timetable</h1>
        <p className="text-gray-600">
          Your semester-wise timetable with multi-period and overlapping courses
        </p>
      </div>

      <div className="space-y-10">
        {Object.entries(semesterCourses).map(([sem, semCourses]) => {
          const timetable = getTimetable(semCourses);

          return (
            <div key={sem} className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-blue-500 pl-4">
                Semester {sem}
              </h2>

              <div className="overflow-x-auto shadow-lg rounded-lg">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                      <th className="px-4 py-4 text-left font-semibold border border-blue-500">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>Day / Time</span>
                        </div>
                      </th>
                      {timeSlots.map(time => (
                        <th
                          key={time}
                          className="px-4 py-4 text-center font-semibold border border-blue-500 min-w-[200px]"
                        >
                          <div className="font-bold text-sm">{time}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map((day, dayIndex) => (
                      <tr key={day} className={dayIndex % 2 === 0 ? 'bg-gray-25' : 'bg-white'}>
                        <td className="px-4 py-4 font-semibold text-gray-700 border border-gray-300 bg-gradient-to-r from-gray-100 to-gray-50">
                          <div className="text-center">
                            <div className="font-bold">{day}</div>
                          </div>
                        </td>
                        {timeSlots.map(time => {
                          const cell = timetable[day][time];

                          return (
                            <td
                              key={`${day}-${time}`}
                              className="px-2 py-2 border border-gray-300 align-top"
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
                {/* Legend */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Legend</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-blue-100 border-2 border-blue-200 rounded"></div>
                      <span className="text-sm text-gray-700">Regular Course</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-purple-100 border-2 border-purple-200 rounded"></div>
                      <span className="text-sm text-gray-700">Multi-Period Course</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-amber-100 border-2 border-amber-300 rounded"></div>
                      <span className="text-sm text-gray-700">Multiple Courses in Same Slot</span>
                    </div>
                  </div>
                </div>

                {/* Course Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Course Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Courses:</span>
                      <span className="font-semibold">{semCourses.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Multi-Period Courses:</span>
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
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <div className="text-gray-500 text-lg">No courses found</div>
            <div className="text-gray-400 text-sm mt-2">
              You haven't enrolled in any courses yet.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCourses;
