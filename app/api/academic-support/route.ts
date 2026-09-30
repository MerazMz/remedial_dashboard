import { NextRequest, NextResponse } from 'next/server';

export interface StudentAcademicData {
  studentDetails: {
    registerationNumber: string;
    studentName: string;
    section: string;
    cgpa: number;
    programName: string;
    termId: number;
    currentAttendance: number;
    isEligibleForPeerTutoring: boolean;
    isEligibleForRemedial: boolean;
  };
  courseDetails: {
    courseCode: string;
    courseName: string;
    attended: number;
    totalClasses: number;
    courseAttendancePercentage: number;
    grade?: string;
  }[];
}

const studentsDatabase: Record<string, StudentAcademicData> = {
  // 1. Subhadeep Mondal - M.Design (UI/UX) - Clean Record
  '12500078': {
    studentDetails: {
      registerationNumber: '12500078',
      studentName: 'Subhadeep Mondal',
      section: 'O2515',
      cgpa: 0.00,
      programName: 'M.Design (UI/UX)',
      termId: 125262,
      currentAttendance: 100.00,
      isEligibleForPeerTutoring: true,
      isEligibleForRemedial: false,
    },
    courseDetails: [
      {
        courseCode: 'IFD516',
        courseName: 'INDIAN KNOWLEDGE IN ADVANCED DESIGN PRACTICE',
        attended: 2,
        totalClasses: 2,
        courseAttendancePercentage: 100.00,
      },
      {
        courseCode: 'IXD522',
        courseName: 'DESIGN STUDIO-II',
        attended: 11,
        totalClasses: 11,
        courseAttendancePercentage: 100.00,
      },
      {
        courseCode: 'IXD523',
        courseName: 'HUMAN COMPUTER INTERACTIONS',
        attended: 3,
        totalClasses: 5,
        courseAttendancePercentage: 60.00,
      },
      {
        courseCode: 'IXD532',
        courseName: 'ADVANCED TYPOGRAPHY     ',
        attended: 1,
        totalClasses: 1,
        courseAttendancePercentage: 100.00,
      },
      {
        courseCode: 'IXD540',
        courseName: 'USER RESEARCH ',
        attended: 1,
        totalClasses: 1,
        courseAttendancePercentage: 100.00,
      },
      {
        courseCode: 'IXD550',
        courseName: 'NARRATIVE COMMUNICATION IN UI DESIGN',
        attended: 4,
        totalClasses: 7,
        courseAttendancePercentage: 57.14,
      },
      {
        courseCode: 'IXD558',
        courseName: 'USABILITY ENGINEERING AND USER TESTING',
        attended: 2,
        totalClasses: 2,
        courseAttendancePercentage: 100.00,
      },
      {
        courseCode: 'IXD571',
        courseName: 'DISSERTATION-I',
        attended: 0,
        totalClasses: 0,
        courseAttendancePercentage: 0.00,
      },
      {
        courseCode: 'PID541',
        courseName: 'TOY DESIGN',
        attended: 0,
        totalClasses: 0,
        courseAttendancePercentage: 0.00,
      },
    ],
  },

  // 2. Aarav Patel - B.Tech. (Information Technology) - 2 Backlogs
  '12304821': {
    studentDetails: {
      registerationNumber: '12304821',
      studentName: 'Aarav Patel',
      section: 'K2310',
      cgpa: 5.75,
      programName: 'B.Tech. (Information Technology)',
      termId: 124251,
      currentAttendance: 85.25,
      isEligibleForPeerTutoring: false,
      isEligibleForRemedial: true,
    },
    courseDetails: [
      {
        courseCode: 'CSE205',
        courseName: 'DATA STRUCTURES AND ALGORITHMS',
        attended: 10,
        totalClasses: 18,
        courseAttendancePercentage: 55.55,
        grade: 'F',
      },
      {
        courseCode: 'MEC102',
        courseName: 'ENGINEERING GRAPHICS & MODELING',
        attended: 12,
        totalClasses: 16,
        courseAttendancePercentage: 75.00,
        grade: 'E',
      },
      {
        courseCode: 'INT219',
        courseName: 'FRONT END WEB DEVELOPMENT (REACT & NODE.JS)',
        attended: 22,
        totalClasses: 25,
        courseAttendancePercentage: 88.00,
      },
      {
        courseCode: 'CSE316',
        courseName: 'OPERATING SYSTEMS & SHELL SCRIPTING',
        attended: 33,
        totalClasses: 40,
        courseAttendancePercentage: 82.50,
      },
      {
        courseCode: 'MTH401',
        courseName: 'DISCRETE MATHEMATICS & GRAPH THEORY',
        attended: 18,
        totalClasses: 20,
        courseAttendancePercentage: 90.00,
      },
    ],
  },

  // 3. Ananya Verma - B.Tech. (Computer Science & Engineering) - Clean Record (9.42 CGPA)
  '12209384': {
    studentDetails: {
      registerationNumber: '12209384',
      studentName: 'Ananya Verma',
      section: 'K2218',
      cgpa: 9.42,
      programName: 'B.Tech. (Computer Science & Engineering)',
      termId: 124252,
      currentAttendance: 95.80,
      isEligibleForPeerTutoring: true,
      isEligibleForRemedial: false,
    },
    courseDetails: [
      {
        courseCode: 'CAP776',
        courseName: 'DEEP LEARNING & NEURAL NETWORKS',
        attended: 39,
        totalClasses: 40,
        courseAttendancePercentage: 97.50,
      },
      {
        courseCode: 'INT354',
        courseName: 'NATURAL LANGUAGE PROCESSING',
        attended: 31,
        totalClasses: 33,
        courseAttendancePercentage: 93.94,
      },
      {
        courseCode: 'CSE322',
        courseName: 'CLOUD COMPUTING ARCHITECTURE (AWS & GCP)',
        attended: 23,
        totalClasses: 25,
        courseAttendancePercentage: 92.00,
      },
      {
        courseCode: 'CSE325',
        courseName: 'ADVANCED SYSTEM PROGRAMMING & LINUX KERNEL',
        attended: 28,
        totalClasses: 29,
        courseAttendancePercentage: 96.55,
      },
    ],
  },

  // 4. Rohit Kumar - B.Tech. (Computer Science & Engineering) - 2 Backlogs
  '12019483': {
    studentDetails: {
      registerationNumber: '12019483',
      studentName: 'Rohit Kumar',
      section: 'K2008',
      cgpa: 5.92,
      programName: 'B.Tech. (Computer Science & Engineering)',
      termId: 124251,
      currentAttendance: 76.50,
      isEligibleForPeerTutoring: false,
      isEligibleForRemedial: true,
    },
    courseDetails: [
      {
        courseCode: 'CSE401',
        courseName: 'COMPILER DESIGN & AUTOMATA THEORY',
        attended: 8,
        totalClasses: 15,
        courseAttendancePercentage: 53.33,
        grade: 'F',
      },
      {
        courseCode: 'CSE310',
        courseName: 'PROGRAMMING IN JAVA (ADVANCED & ENTERPRISE)',
        attended: 12,
        totalClasses: 18,
        courseAttendancePercentage: 66.67,
        grade: 'E',
      },
      {
        courseCode: 'CSE499',
        courseName: 'INDUSTRY INTERNSHIP & CAPSTONE VIVA',
        attended: 24,
        totalClasses: 25,
        courseAttendancePercentage: 96.00,
      },
    ],
  },

  // 5. Priya Nair - M.Tech. (Computer Science - Data Science) - Clean Record
  '12401923': {
    studentDetails: {
      registerationNumber: '12401923',
      studentName: 'Priya Nair',
      section: 'M2401',
      cgpa: 8.90,
      programName: 'M.Tech. (Computer Science - Data Science)',
      termId: 125261,
      currentAttendance: 92.50,
      isEligibleForPeerTutoring: true,
      isEligibleForRemedial: false,
    },
    courseDetails: [
      {
        courseCode: 'CAP680',
        courseName: 'BIG DATA ENGINEERING & APACHE SPARK',
        attended: 19,
        totalClasses: 20,
        courseAttendancePercentage: 95.00,
      },
      {
        courseCode: 'CAP692',
        courseName: 'STATISTICAL MACHINE LEARNING',
        attended: 18,
        totalClasses: 20,
        courseAttendancePercentage: 90.00,
      },
      {
        courseCode: 'CAP601',
        courseName: 'ADVANCED ALGORITHMS & COMPLEXITY ANALYSIS',
        attended: 22,
        totalClasses: 23,
        courseAttendancePercentage: 95.65,
      },
    ],
  },

  // 6. Vikrant Sharma - B.Tech. (Mechanical Engineering) - 2 Backlogs (Grade F & E)
  '12105672': {
    studentDetails: {
      registerationNumber: '12105672',
      studentName: 'Vikrant Sharma',
      section: 'M2103',
      cgpa: 6.10,
      programName: 'B.Tech. (Mechanical Engineering)',
      termId: 124251,
      currentAttendance: 78.50,
      isEligibleForPeerTutoring: false,
      isEligibleForRemedial: true,
    },
    courseDetails: [
      {
        courseCode: 'MEC201',
        courseName: 'THERMODYNAMICS & HEAT TRANSFER',
        attended: 10,
        totalClasses: 18,
        courseAttendancePercentage: 55.55,
        grade: 'F',
      },
      {
        courseCode: 'MEC204',
        courseName: 'FLUID MECHANICS & HYDRAULIC MACHINERY',
        attended: 12,
        totalClasses: 18,
        courseAttendancePercentage: 66.67,
        grade: 'E',
      },
      {
        courseCode: 'MEC311',
        courseName: 'KINEMATICS & DYNAMICS OF MACHINES',
        attended: 26,
        totalClasses: 30,
        courseAttendancePercentage: 86.67,
      },
      {
        courseCode: 'MTH202',
        courseName: 'ENGINEERING MATHEMATICS-III',
        attended: 24,
        totalClasses: 28,
        courseAttendancePercentage: 85.71,
      },
    ],
  },

  // 7. Neha Gupta - B.Sc. (Computer Science) - Clean Record (9.15 CGPA)
  '12318490': {
    studentDetails: {
      registerationNumber: '12318490',
      studentName: 'Neha Gupta',
      section: 'S2301',
      cgpa: 9.15,
      programName: 'B.Sc. (Computer Science)',
      termId: 124252,
      currentAttendance: 96.00,
      isEligibleForPeerTutoring: true,
      isEligibleForRemedial: false,
    },
    courseDetails: [
      {
        courseCode: 'CSC201',
        courseName: 'OBJECT ORIENTED PROGRAMMING IN C++',
        attended: 28,
        totalClasses: 28,
        courseAttendancePercentage: 100.00,
      },
      {
        courseCode: 'CSC204',
        courseName: 'DATABASE MANAGEMENT SYSTEMS & SQL',
        attended: 25,
        totalClasses: 26,
        courseAttendancePercentage: 96.15,
      },
      {
        courseCode: 'CSC207',
        courseName: 'COMPUTER NETWORKS & PROTOCOLS',
        attended: 22,
        totalClasses: 24,
        courseAttendancePercentage: 91.67,
      },
      {
        courseCode: 'GEN105',
        courseName: 'TECHNICAL WRITING & RESEARCH ETHICS',
        attended: 15,
        totalClasses: 15,
        courseAttendancePercentage: 100.00,
      },
    ],
  },

  // 8. Hardik Singh - B.Tech. (Electronics & Communication Engineering) - 2 Backlogs (Grade G & E)
  '12214567': {
    studentDetails: {
      registerationNumber: '12214567',
      studentName: 'Hardik Singh',
      section: 'E2204',
      cgpa: 5.85,
      programName: 'B.Tech. (Electronics & Communication Engineering)',
      termId: 124251,
      currentAttendance: 72.00,
      isEligibleForPeerTutoring: false,
      isEligibleForRemedial: true,
    },
    courseDetails: [
      {
        courseCode: 'ECE301',
        courseName: 'DIGITAL SIGNAL PROCESSING & APPLICATIONS',
        attended: 10,
        totalClasses: 20,
        courseAttendancePercentage: 50.00,
        grade: 'G',
      },
      {
        courseCode: 'ECE208',
        courseName: 'MICROPROCESSORS & EMBEDDED SYSTEMS',
        attended: 12,
        totalClasses: 22,
        courseAttendancePercentage: 54.55,
        grade: 'E',
      },
      {
        courseCode: 'ECE315',
        courseName: 'VLSI DESIGN & VERILOG HDL',
        attended: 25,
        totalClasses: 30,
        courseAttendancePercentage: 83.33,
      },
      {
        courseCode: 'ECE320',
        courseName: 'ANALOG & DIGITAL COMMUNICATION',
        attended: 22,
        totalClasses: 26,
        courseAttendancePercentage: 84.62,
      },
    ],
  },

  // 9. Ishaan Sen - MBA (Finance & Business Analytics) - Clean Record (8.75 CGPA)
  '12501144': {
    studentDetails: {
      registerationNumber: '12501144',
      studentName: 'Ishaan Sen',
      section: 'B2502',
      cgpa: 8.75,
      programName: 'MBA (Finance & Business Analytics)',
      termId: 125262,
      currentAttendance: 94.20,
      isEligibleForPeerTutoring: true,
      isEligibleForRemedial: false,
    },
    courseDetails: [
      {
        courseCode: 'FIN602',
        courseName: 'ADVANCED FINANCIAL MODELING & VALUATION',
        attended: 24,
        totalClasses: 24,
        courseAttendancePercentage: 100.00,
      },
      {
        courseCode: 'ANL605',
        courseName: 'PREDICTIVE BUSINESS ANALYTICS WITH PYTHON',
        attended: 20,
        totalClasses: 22,
        courseAttendancePercentage: 90.91,
      },
      {
        courseCode: 'MGT610',
        courseName: 'STRATEGIC MANAGEMENT & LEADERSHIP',
        attended: 18,
        totalClasses: 20,
        courseAttendancePercentage: 90.00,
      },
      {
        courseCode: 'FIN608',
        courseName: 'CORPORATE MERGERS, ACQUISITIONS & RESTRUCTURING',
        attended: 16,
        totalClasses: 16,
        courseAttendancePercentage: 100.00,
      },
    ],
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const regNo = searchParams.get('regNo');
  const returnAll = searchParams.get('all');

  // If client requests all students list
  if (returnAll === 'true') {
    return NextResponse.json(
      {
        success: true,
        message: 'Student academic support details fetched successfully.',
        total: Object.keys(studentsDatabase).length,
        data: Object.values(studentsDatabase),
      },
      { status: 200 }
    );
  }

  // Lookup student by registrationNumber or default to Subhadeep Mondal (12500078)
  const studentData = (regNo && studentsDatabase[regNo])
    ? studentsDatabase[regNo]
    : studentsDatabase['12500078'];

  return NextResponse.json(
    {
      success: true,
      message: 'Student academic support details fetched successfully.',
      data: studentData,
    },
    { status: 200 }
  );
}
