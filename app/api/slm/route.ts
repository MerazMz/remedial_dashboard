import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { SLMCourse, SLMDocument } from '../../../src/mock/slmMockData';

// Helper function to get the target file paths
function getDataPaths(): string[] {
  const paths: string[] = [];
  
  // 1. Current working directory data file (remedial_dashboard/data/slm_courses.json)
  const localDataDir = path.join(process.cwd(), 'data');
  paths.push(path.join(localDataDir, 'slm_courses.json'));

  // 2. Project root data directory if different from cwd
  const rootDataDir = path.resolve(process.cwd(), '..', 'data');
  paths.push(path.join(rootDataDir, 'slm_courses.json'));

  return paths;
}

// Read courses from disk
function readCoursesFromFile(): SLMCourse[] {
  const [primaryPath] = getDataPaths();

  try {
    if (fs.existsSync(primaryPath)) {
      const fileData = fs.readFileSync(primaryPath, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error reading SLM courses file:', error);
  }

  // Fallback: check secondary path
  const paths = getDataPaths();
  if (paths.length > 1 && fs.existsSync(paths[1])) {
    try {
      const fileData = fs.readFileSync(paths[1], 'utf-8');
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      console.error('Error reading secondary SLM courses file:', error);
    }
  }

  return [];
}

// Write courses to disk across all designated paths
function writeCoursesToFile(courses: SLMCourse[]): boolean {
  const jsonContent = JSON.stringify(courses, null, 2);
  let writtenAtLeastOnce = false;

  for (const filePath of getDataPaths()) {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, jsonContent, 'utf-8');
      writtenAtLeastOnce = true;
    } catch (err) {
      // It's acceptable if the parent directory is inaccessible in certain environments
      console.warn(`Could not write to ${filePath}:`, err);
    }
  }

  return writtenAtLeastOnce;
}

// GET: Fetch all persistent SLM courses and materials
export async function GET() {
  try {
    const courses = readCoursesFromFile();
    return NextResponse.json(
      {
        success: true,
        message: 'SLM courses loaded successfully from root data repository.',
        data: courses,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/slm:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve SLM courses from persistent storage.',
        data: [],
      },
      { status: 500 }
    );
  }
}

// POST: Add course, upload document, delete document, or bulk update
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, course, document, courseCode, documentId, courses: bulkCourses } = body;

    let courses = readCoursesFromFile();

    if (action === 'add_course') {
      if (!course || !course.courseCode) {
        return NextResponse.json(
          { success: false, message: 'Invalid course details provided.' },
          { status: 400 }
        );
      }

      // Check if course already exists; if so, update, else prepend
      const existingIdx = courses.findIndex(
        (c) => c.courseCode.toLowerCase() === course.courseCode.toLowerCase()
      );

      if (existingIdx >= 0) {
        courses[existingIdx] = {
          ...courses[existingIdx],
          ...course,
          documents: courses[existingIdx].documents || [],
        };
      } else {
        const newCourse: SLMCourse = {
          ...course,
          documents: course.documents || [],
        };
        courses = [newCourse, ...courses];
      }
    } else if (action === 'upload_document') {
      if (!courseCode || !document) {
        return NextResponse.json(
          { success: false, message: 'Course code and document details required.' },
          { status: 400 }
        );
      }

      const courseIdx = courses.findIndex(
        (c) => c.courseCode.toLowerCase() === courseCode.toLowerCase()
      );

      if (courseIdx === -1) {
        return NextResponse.json(
          { success: false, message: `Course ${courseCode} does not exist.` },
          { status: 404 }
        );
      }

      const newDoc: SLMDocument = {
        ...document,
        id: document.id || `doc-${Date.now()}`,
        uploadedAt: document.uploadedAt || 'Today',
        downloadsCount: document.downloadsCount || 0,
      };

      courses[courseIdx].documents = [newDoc, ...(courses[courseIdx].documents || [])];
    } else if (action === 'delete_document') {
      if (!courseCode || !documentId) {
        return NextResponse.json(
          { success: false, message: 'Course code and document ID required for deletion.' },
          { status: 400 }
        );
      }

      const courseIdx = courses.findIndex(
        (c) => c.courseCode.toLowerCase() === courseCode.toLowerCase()
      );

      if (courseIdx >= 0 && courses[courseIdx].documents) {
        courses[courseIdx].documents = courses[courseIdx].documents.filter(
          (d) => d.id !== documentId
        );
      }
    } else if (action === 'delete_course') {
      if (!courseCode) {
        return NextResponse.json(
          { success: false, message: 'Course code required for deletion.' },
          { status: 400 }
        );
      }

      courses = courses.filter(
        (c) => c.courseCode.toLowerCase() !== courseCode.toLowerCase()
      );
    } else if (action === 'save_all' && Array.isArray(bulkCourses)) {
      courses = bulkCourses;
    } else {
      return NextResponse.json(
        { success: false, message: 'Unknown action specified.' },
        { status: 400 }
      );
    }

    // Persist to file
    writeCoursesToFile(courses);

    return NextResponse.json(
      {
        success: true,
        message: 'Changes persisted successfully to root file storage.',
        data: courses,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/slm:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to persist changes to disk.',
      },
      { status: 500 }
    );
  }
}
