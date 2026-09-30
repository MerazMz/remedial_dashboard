'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import Breadcrumb from '../src/components/Breadcrumb';
import StudentProfileCard from '../src/components/StudentProfileCard';
import ClassAccordionContainer from '../src/components/ClassAccordionContainer';
import CourseDetailDrawer from '../src/components/CourseDetailDrawer';
import RemedialRegisterDialog from '../src/components/RemedialRegisterDialog';
import TuitionDoubtDialog from '../src/components/TuitionDoubtDialog';
import GlobalTuitionRequestDialog from '../src/components/GlobalTuitionRequestDialog';
import PeerTutorRegisterDialog from '../src/components/PeerTutorRegisterDialog';
import {
  mockStudents,
  StudentProfile,
  RemedialCourse,
  TuitionCourse,
  PeerTutorCourse,
} from '../src/mock/remedialMockData';
import {
  fetchAcademicSupportData,
  mapAPIToStudentProfile,
} from '../src/services/academicSupportService';

export default function RemedialDashboardPage() {
  // Current Student state
  const [studentsList, setStudentsList] = useState<StudentProfile[]>(mockStudents);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile>(mockStudents[0]);
  const [loadingAPI, setLoadingAPI] = useState(false);

  // Fetch live student academic support data from the configured API endpoint (.env)
  const loadStudentDataFromAPI = useCallback(async (std: StudentProfile) => {
    setLoadingAPI(true);
    try {
      const apiData = await fetchAcademicSupportData(std.registrationNo);
      const updatedProfile = mapAPIToStudentProfile(apiData, std);
      setSelectedStudent(updatedProfile);
      setStudentsList((prev) =>
        prev.map((s) => (s.registrationNo === std.registrationNo ? updatedProfile : s))
      );
    } catch (err) {
      console.warn('Could not fetch from live API endpoint, using local mock data:', err);
      // Graceful fallback to local mock data
      setSelectedStudent(std);
    } finally {
      setLoadingAPI(false);
    }
  }, []);

  // Initial load from API on mount
  useEffect(() => {
    loadStudentDataFromAPI(mockStudents[0]);
  }, [loadStudentDataFromAPI]);

  // Modals & Drawers state
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [activeCourse, setActiveCourse] = useState<RemedialCourse | TuitionCourse | null>(null);
  const [activeType, setActiveType] = useState<'remedial' | 'tuition'>('remedial');

  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [selectedRemedialCourse, setSelectedRemedialCourse] = useState<RemedialCourse | null>(null);

  const [doubtDialogOpen, setDoubtDialogOpen] = useState(false);
  const [selectedTuitionCourse, setSelectedTuitionCourse] = useState<TuitionCourse | null>(null);

  // Global Tuition Request state
  const [globalRequestOpen, setGlobalRequestOpen] = useState(false);

  // Peer Tutor Modal state
  const [peerTutorDialogOpen, setPeerTutorDialogOpen] = useState(false);
  const [selectedPeerTutorCourse, setSelectedPeerTutorCourse] = useState<PeerTutorCourse | null>(null);

  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  // Switch student & fetch their API data
  const handleSelectStudent = (std: StudentProfile) => {
    setActiveCourse(null);
    setDetailDrawerOpen(false);
    loadStudentDataFromAPI(std);
    setSnackbarMessage(`Loaded profile for ${std.name} (${std.registrationNo})`);
  };

  // Open Details Drawer for Remedial Course
  const handleOpenRemedialDetails = (course: RemedialCourse) => {
    setActiveCourse(course);
    setActiveType('remedial');
    setDetailDrawerOpen(true);
  };

  // Open Details Drawer for Tuition Course
  const handleOpenTuitionDetails = (course: TuitionCourse) => {
    setActiveCourse(course);
    setActiveType('tuition');
    setDetailDrawerOpen(true);
  };

  // Open Register Modal for Remedial Course
  const handleOpenRegister = (course: RemedialCourse) => {
    setSelectedRemedialCourse(course);
    setRegisterDialogOpen(true);
  };

  // Open Tuition Support Modal (Online Classes vs Study Material)
  const handleOpenTuitionSupport = (course: TuitionCourse) => {
    setSelectedTuitionCourse(course);
    setDoubtDialogOpen(true);
  };

  // Open Peer Tutor Apply Modal
  const handleOpenPeerTutorApply = (course: PeerTutorCourse) => {
    setSelectedPeerTutorCourse(course);
    setPeerTutorDialogOpen(true);
  };

  // Remedial Registration Confirmation Handler
  const handleConfirmRegistration = (courseId: string) => {
    const updatedRemedial = selectedStudent.remedialCourses.map((c) =>
      c.id === courseId ? { ...c, remedialBatchStatus: 'Registered' as const } : c
    );
    const updatedStudent = { ...selectedStudent, remedialCourses: updatedRemedial };

    setSelectedStudent(updatedStudent);
    setStudentsList((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    if (activeCourse && activeCourse.id === courseId) {
      setActiveCourse({ ...activeCourse, remedialBatchStatus: 'Registered' } as RemedialCourse);
    }
    setSnackbarMessage('Successfully registered in the Remedial Class batch!');
  };

  // Peer Tutor Application Confirmation Handler
  const handleConfirmPeerTutorRegistration = (courseId: string) => {
    const updatedTutor = (selectedStudent.peerTutorCourses || []).map((c) =>
      c.id === courseId ? { ...c, tutorStatus: 'Active Tutor' as const, activeBatchesCount: 1, assignedJuniorStudentsCount: 4 } : c
    );
    const updatedStudent = { ...selectedStudent, peerTutorCourses: updatedTutor };

    setSelectedStudent(updatedStudent);
    setStudentsList((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    setSnackbarMessage('Enrolled as Peer Tutor! Junior student batch allocated.');
  };

  // Global Tuition Request Handler
  const handleGlobalRequestSuccess = (courseCode: string, supportType: string) => {
    const supportLabel = supportType === 'online_classes' ? 'Online Extra Classes' : 'Study Material Bundle';
    setSnackbarMessage(`Tuition Request submitted for ${courseCode} (${supportLabel})!`);
  };

  const isRemedial = selectedStudent.isEligibleForRemedial ?? (selectedStudent.remedialCourses || []).length > 0;

  return (
    <Box>
      {/* 1. Breadcrumb Navigation with Integrated Description */}
      <Breadcrumb
        title="Academic Support: Remedial, Tuition & Peer Mentorship"
        subtitle={
          isRemedial
            ? "Explore Ongoing Tuition Classes and manage your Remedial Backlog registrations."
            : "Explore Ongoing Tuition Classes and register to mentor junior students as an official Peer Tutor."
        }
        items={[
          { title: 'Academic Services' },
          { title: 'Remedial, Tuition & Peer Tutoring' },
        ]}
      />

      {/* 2. Student Profile Summary Card & Switcher */}
      <StudentProfileCard
        students={studentsList}
        selectedStudent={selectedStudent}
        onSelectStudent={handleSelectStudent}
      />

      {/* 3. Modern Accordion Container (Remedial + Tuition + Peer Tutor) */}
      <ClassAccordionContainer
        student={selectedStudent}
        onOpenRemedialDetails={handleOpenRemedialDetails}
        onOpenRemedialRegister={handleOpenRegister}
        onOpenTuitionDetails={handleOpenTuitionDetails}
        onOpenTuitionSupport={handleOpenTuitionSupport}
        onOpenGlobalRequest={() => setGlobalRequestOpen(true)}
        onOpenPeerTutorApply={handleOpenPeerTutorApply}
      />

      {/* 4. Course Details Slide-Over Drawer */}
      <CourseDetailDrawer
        open={detailDrawerOpen}
        onClose={() => {
          setDetailDrawerOpen(false);
          setActiveCourse(null);
        }}
        course={activeCourse}
        type={activeType}
        onRegisterRemedial={handleOpenRegister}
      />

      {/* 5. Remedial Batch Registration Dialog */}
      <RemedialRegisterDialog
        open={registerDialogOpen}
        onClose={() => setRegisterDialogOpen(false)}
        course={selectedRemedialCourse}
        onConfirmSuccess={handleConfirmRegistration}
      />

      {/* 6. Tuition Support & Resources Booking Dialog (Online Classes vs Study Material) */}
      <TuitionDoubtDialog
        open={doubtDialogOpen}
        onClose={() => setDoubtDialogOpen(false)}
        course={selectedTuitionCourse}
      />

      {/* 7. Global Tuition Request Dialog (Search any previous term subject + auto-grade) */}
      <GlobalTuitionRequestDialog
        open={globalRequestOpen}
        onClose={() => setGlobalRequestOpen(false)}
        student={selectedStudent}
        onSubmitSuccess={handleGlobalRequestSuccess}
      />

      {/* 8. Peer Tutor Application Modal */}
      <PeerTutorRegisterDialog
        open={peerTutorDialogOpen}
        onClose={() => setPeerTutorDialogOpen(false)}
        course={selectedPeerTutorCourse}
        onConfirmSuccess={handleConfirmPeerTutorRegistration}
      />

      {/* 9. Feedback Snackbar Toast */}
      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={4000}
        onClose={() => setSnackbarMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarMessage(null)}
          severity="success"
          variant="filled"
          sx={{ width: '100%', borderRadius: '10px', fontWeight: 600 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
