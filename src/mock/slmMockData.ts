export type SLMDocType = 'syllabus' | 'pyq' | 'ip' | 'notes' | 'ppt' | 'other';

export interface SLMDocument {
  id: string;
  courseCode: string;
  name: string;
  type: SLMDocType;
  fileName: string;
  fileSize: string;
  fileFormat: 'pdf' | 'pptx' | 'docx' | 'zip';
  unitModule: string;
  uploadedBy: string;
  uploadedAt: string;
  downloadsCount: number;
  description?: string;
  sampleContent?: {
    overview?: string;
    sections?: { title: string; content: string }[];
    questionsCount?: number;
    slidesCount?: number;
  };
}

export interface SLMCourse {
  courseCode: string;
  courseTitle: string;
  department: string;
  school: string;
  credits: number;
  term: string;
  facultyLead: string;
  totalStudentsEnrolled: number;
  documents: SLMDocument[];
}

// Clean initial courses list - No mock data
export const initialSLMCourses: SLMCourse[] = [];

export const documentTypeLabels: Record<SLMDocType, { label: string; description: string; color: string; bgColor: string; borderColor: string }> = {
  syllabus: {
    label: 'Syllabus',
    description: 'Official Course Outline, Learning Outcomes & Credit Scheme',
    color: '#0284c7',
    bgColor: '#e0f2fe',
    borderColor: '#bae6fd',
  },
  pyq: {
    label: 'PYQ',
    description: 'Previous Year Question Papers, Solved Solutions & Model Answers',
    color: '#d97706',
    bgColor: '#fef3c7',
    borderColor: '#fde68a',
  },
  ip: {
    label: 'IP (Instruction Plan)',
    description: 'Lecture-by-Lecture Breakdown, CA Dates & Lab Deliverables',
    color: '#059669',
    bgColor: '#d1fae5',
    borderColor: '#a7f3d0',
  },
  notes: {
    label: 'Notes',
    description: 'Handwritten & Typed Revision Notes, Formulas & Algorithms',
    color: '#7c3aed',
    bgColor: '#ede9fe',
    borderColor: '#ddd6fe',
  },
  ppt: {
    label: 'PPT / Slides',
    description: 'Class Presentation Slides, Visual Flowcharts & Diagrams',
    color: '#dc2626',
    bgColor: '#fee2e2',
    borderColor: '#fecaca',
  },
  other: {
    label: 'Other Material',
    description: 'Case Studies, Research Articles, Extra Practice Sets',
    color: '#475569',
    bgColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  },
};
