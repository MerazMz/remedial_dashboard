import { StudentProfile, TuitionCourse, RemedialCourse, PeerTutorCourse } from '../mock/remedialMockData';

export interface StudentDetailsAPI {
  registerationNumber: string;
  studentName: string;
  section: string;
  cgpa: number;
  programName: string;
  termId: number;
  currentAttendance: number;
  isEligibleForPeerTutoring: boolean;
  isEligibleForRemedial: boolean;
  backlogCount?: number;
  gradesSummary?: string;
}

export interface CourseDetailAPI {
  courseCode: string;
  courseName: string;
  attended: number;
  totalClasses: number;
  courseAttendancePercentage: number;
  grade?: string;
}

export interface AcademicSupportAPIResponse {
  success: boolean;
  message: string;
  data: {
    studentDetails: StudentDetailsAPI;
    courseDetails: CourseDetailAPI[];
  };
}

/**
 * Fetch academic support details from whatever endpoint is set in .env (NEXT_PUBLIC_ACADEMIC_SUPPORT_API)
 */
export async function fetchAcademicSupportData(regNo?: string): Promise<AcademicSupportAPIResponse['data']> {
  const baseEndpoint = process.env.NEXT_PUBLIC_ACADEMIC_SUPPORT_API || '/api/academic-support';
  
  // Construct URL properly whether baseEndpoint is relative (/api/...) or absolute (https://ums.example.com/api/...)
  let fetchUrl = baseEndpoint;
  if (regNo) {
    const separator = baseEndpoint.includes('?') ? '&' : '?';
    fetchUrl = `${baseEndpoint}${separator}regNo=${encodeURIComponent(regNo)}`;
  }

  const res = await fetch(fetchUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    // Cache configuration: default no-store for dynamic data
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch from API: ${res.status} ${res.statusText}`);
  }

  const json: AcademicSupportAPIResponse = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.message || 'API returned unsuccessful response');
  }

  return json.data;
}

/**
 * Convert the raw API response into the rich StudentProfile structure expected by the UI components
 */
export function mapAPIToStudentProfile(apiData: AcademicSupportAPIResponse['data'], existingProfile?: StudentProfile): StudentProfile {
  const { studentDetails, courseDetails } = apiData;

  // Map Course Details into Tuition Courses
  const tuitionCourses: TuitionCourse[] = courseDetails
    .filter((c) => !c.grade || (c.grade !== 'F' && c.grade !== 'E'))
    .map((c, idx) => ({
      id: `api-tui-${c.courseCode}-${idx}`,
      courseCode: c.courseCode,
      courseTitle: c.courseName,
      credits: 3,
      courseType: 'Integrated',
      instructor: 'Assigned Faculty',
      instructorEmail: 'faculty@lpu.co.in',
      facultyEmpId: 'E10000',
      attendancePercentage: c.courseAttendancePercentage,
      attendedLectures: c.attended,
      totalLectures: c.totalClasses,
      caMarksObtained: 25,
      caMaxMarks: 30,
      weeklySchedule: 'Mon, Wed • 10:00 AM - 11:30 AM',
      roomNo: 'Academic Block',
      syllabusProgress: Math.min(100, Math.round(c.courseAttendancePercentage * 0.8)),
      nextClassTopic: 'Core Module Lectures & Case Studies',
      doubtSessionAvailable: true,
      learningMaterialsCount: 10,
      pendingAssignmentsCount: 0,
    }));

  // Map any backlogs (courses with F, E, G grades) into Remedial Courses
  const remedialCourses: RemedialCourse[] = courseDetails
    .filter((c) => c.grade === 'F' || c.grade === 'E' || c.grade === 'G')
    .map((c, idx) => ({
      id: `api-rem-${c.courseCode}-${idx}`,
      courseCode: c.courseCode,
      courseTitle: c.courseName,
      credits: 4,
      grade: (c.grade as 'F' | 'E' | 'G') || 'F',
      gradeDescription: c.grade === 'F' ? 'Fail in End Term Examination' : 'Reappear / Remedial Backlog',
      termTaken: `Term ${studentDetails.termId || 'Previous'}`,
      courseType: 'Integrated',
      internalMarks: 18,
      externalMarks: 14,
      totalMarks: 32,
      maxMarks: 100,
      remedialBatchStatus: 'Not Registered',
      remedialSlot: 'Mon, Wed, Fri • 05:00 PM - 06:30 PM',
      remedialRoom: 'Block 34, Room 402',
      assignedFaculty: 'Prof. Remedial Coordinator',
      facultyEmail: 'remedial@lpu.co.in',
      facultyEmpId: 'E19999',
      remedialFee: 1500,
      minAttendanceReq: 75,
      eligibilityStatus: 'Eligible',
      attemptsLeft: 2,
      syllabusTopics: [
        { title: 'Fundamental Concepts & Problem Solving', hours: 6, status: 'Pending' },
        { title: 'Core Syllabus Revision & Practice Sets', hours: 6, status: 'Pending' },
      ],
      remarks: 'Remedial batch attendance required to clear exam.',
    }));

  // Peer Tutor courses (if student is eligible and has no backlogs)
  const peerTutorCourses: PeerTutorCourse[] =
    remedialCourses.length === 0 && studentDetails.isEligibleForPeerTutoring
      ? existingProfile?.peerTutorCourses && existingProfile.peerTutorCourses.length > 0
        ? existingProfile.peerTutorCourses
        : [
            {
              id: 'api-tutor-1',
              courseCode: courseDetails[0]?.courseCode || 'CSE101',
              courseTitle: courseDetails[0]?.courseName || 'Computer Programming & Logic',
              termTaken: `Term ${studentDetails.termId || '1'}`,
              semester: 1,
              grade: 'O',
              gradeDescription: 'Grade O - Outstanding Performance (Top 2%)',
              marksObtained: 94,
              maxMarks: 100,
              credits: 4,
              courseType: 'Integrated',
              tutorStatus: 'Active Tutor',
              activeBatchesCount: 1,
              assignedJuniorStudentsCount: 5,
              hourlyHonorarium: 500,
              recommendedWeeklyHours: 4,
              preferredSlot: 'Tue, Thu • 05:00 PM - 06:30 PM',
              preferredMode: 'Online (Google Meet)',
            },
          ]
      : [];

  return {
    id: existingProfile?.id || `std-${studentDetails.registerationNumber}`,
    registrationNo: studentDetails.registerationNumber,
    rollNo: existingProfile?.rollNo || `R-${studentDetails.registerationNumber.slice(-4)}`,
    name: studentDetails.studentName,
    program: studentDetails.programName,
    department: existingProfile?.department || 'School of Academic Studies',
    currentSemester: existingProfile?.currentSemester || 2,
    section: studentDetails.section,
    cgpa: studentDetails.cgpa,
    avatar: existingProfile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
    advisor: existingProfile?.advisor || 'Academic Support Coordinator',
    advisorEmail: existingProfile?.advisorEmail || 'advisor@lpu.co.in',
    totalCreditsCompleted: existingProfile?.totalCreditsCompleted || 36,
    isEligibleForPeerTutoring: studentDetails.isEligibleForPeerTutoring,
    isEligibleForRemedial: studentDetails.isEligibleForRemedial,
    profileTag: studentDetails.isEligibleForRemedial
      ? `${remedialCourses.length > 0 ? remedialCourses.length : 2} Backlogs • Remedial Needed`
      : 'No Backlogs • Clean Record',
    remedialCourses: remedialCourses.length > 0 ? remedialCourses : (existingProfile?.remedialCourses || []),
    tuitionCourses: tuitionCourses.length > 0 ? tuitionCourses : (existingProfile?.tuitionCourses || []),
    academicHistory: existingProfile?.academicHistory || [],
    peerTutorCourses,
  };
}
