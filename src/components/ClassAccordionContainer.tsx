'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import {
  IconAlertTriangle,
  IconBooks,
  IconChevronDown,
  IconChartBar,
  IconSchool,
  IconAward,
} from '@tabler/icons-react';
import { StudentProfile, RemedialCourse, TuitionCourse, PeerTutorCourse } from '../mock/remedialMockData';
import RemedialCourseList from './RemedialCourseList';
import TuitionCourseList from './TuitionCourseList';
import PeerTutorCourseList from './PeerTutorCourseList';

interface ClassAccordionContainerProps {
  student: StudentProfile;
  onOpenRemedialDetails: (course: RemedialCourse) => void;
  onOpenRemedialRegister: (course: RemedialCourse) => void;
  onOpenTuitionDetails: (course: TuitionCourse) => void;
  onOpenTuitionSupport: (course: TuitionCourse) => void;
  onOpenGlobalRequest: () => void;
  onOpenPeerTutorApply: (course: PeerTutorCourse) => void;
}

export default function ClassAccordionContainer({
  student,
  onOpenRemedialDetails,
  onOpenRemedialRegister,
  onOpenTuitionDetails,
  onOpenTuitionSupport,
  onOpenGlobalRequest,
  onOpenPeerTutorApply,
}: ClassAccordionContainerProps) {
  // Tuition Classes open by default
  const [expandedPanel, setExpandedPanel] = useState<string | false>('tuition');

  // Check eligibility flags directly from the API (mutually exclusive)
  const isRemedialEligible = student.isEligibleForRemedial === true || (student.isEligibleForRemedial !== false && (student.remedialCourses || []).length > 0);

  // Reset expanded state if switching between students whose active panel becomes invalid
  useEffect(() => {
    if (expandedPanel === 'remedial' && !isRemedialEligible) {
      setExpandedPanel(false);
    } else if (expandedPanel === 'peertutor' && isRemedialEligible) {
      setExpandedPanel(false);
    }
  }, [student.id, isRemedialEligible, expandedPanel]);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const fCount = (student.remedialCourses || []).filter((c) => c.grade === 'F').length;
  const eCount = (student.remedialCourses || []).filter((c) => c.grade === 'E').length;
  const gCount = (student.remedialCourses || []).filter((c) => c.grade === 'G').length;

  const avgAttendance =
    student.tuitionCourses.length > 0
      ? (
          student.tuitionCourses.reduce((acc, c) => acc + c.attendancePercentage, 0) /
          student.tuitionCourses.length
        ).toFixed(1)
      : '0';

  const eligibleTutorCount = (student.peerTutorCourses || []).length;
  const activeTutorCount = (student.peerTutorCourses || []).filter((c) => c.tutorStatus === 'Active Tutor').length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 4 }}>
      {/* 1. TOP ACCORDION: TUITION CLASSES (ALWAYS AT THE TOP) */}
      <Accordion
        expanded={expandedPanel === 'tuition'}
        onChange={handleChange('tuition')}
        disableGutters
        elevation={0}
        sx={{
          borderRadius: '16px !important',
          border: '1px solid',
          borderColor: expandedPanel === 'tuition' ? '#bce1f8' : '#edf2f7',
          bgcolor: '#ffffff',
          overflow: 'hidden',
          transition: 'all 0.25s ease',
          boxShadow: expandedPanel === 'tuition' ? '0 8px 30px rgba(0, 133, 219, 0.07)' : '0 2px 6px rgba(0,0,0,0.01)',
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary
          expandIcon={<IconChevronDown size={22} style={{ color: expandedPanel === 'tuition' ? '#0085db' : '#94a3b8' }} />}
          sx={{
            p: { xs: 2.25, sm: 2.75 },
            bgcolor: expandedPanel === 'tuition' ? '#fafcff' : '#ffffff',
            borderBottom: expandedPanel === 'tuition' ? '1px solid #edf2f7' : 'none',
            '& .MuiAccordionSummary-content': {
              m: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            },
          }}
        >
          {/* Header Left: Icon & Titles */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                bgcolor: '#edf6fc',
                color: '#0085db',
                p: 1.25,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconBooks size={24} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#111c2d' }}>
                  Tuition Classes (Current Semester)
                </Typography>
                <Chip
                  size="small"
                  label={`${student.tuitionCourses.length} Courses`}
                  sx={{
                    bgcolor: '#edf6fc',
                    color: '#0085db',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    border: '1px solid #c7e5f9',
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mt: 0.25 }}>
                Current term courses with live attendance tracking, CA marks, online extra classes & study materials.
              </Typography>
            </Box>
          </Box>

          {/* Header Right: Attendance Badge */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, mr: 2 }}>
            <Chip
              icon={<IconChartBar size={15} style={{ color: '#2e9d64' }} />}
              size="small"
              label={`Avg Attendance: ${avgAttendance}%`}
              sx={{ bgcolor: '#e8f8f0', color: '#2e9d64', fontWeight: 700, fontSize: '0.75rem' }}
            />
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ p: { xs: 2.5, sm: 3.5 }, bgcolor: '#ffffff' }}>
          <TuitionCourseList
            courses={student.tuitionCourses}
            onOpenDetails={onOpenTuitionDetails}
            onBookDoubtSession={onOpenTuitionSupport}
            onOpenGlobalRequest={onOpenGlobalRequest}
          />
        </AccordionDetails>
      </Accordion>

      {/* 2. DYNAMIC MUTUALLY EXCLUSIVE ACCORDION BASED ON API ELIGIBILITY STATUS:
          - isEligibleForRemedial = true  -> SHOW REMEDIAL CLASSES (PEER TUTOR HIDDEN)
          - isEligibleForPeerTutoring = true (isEligibleForRemedial = false) -> SHOW PEER TUTOR (REMEDIAL CLASSES HIDDEN)
      */}
      {isRemedialEligible ? (
        /* REMEDIAL CLASSES ACCORDION (Visible ONLY when student isEligibleForRemedial is true) */
        <Accordion
          expanded={expandedPanel === 'remedial'}
          onChange={handleChange('remedial')}
          disableGutters
          elevation={0}
          sx={{
            borderRadius: '16px !important',
            border: '1px solid',
            borderColor: expandedPanel === 'remedial' ? '#bce1f8' : '#edf2f7',
            bgcolor: '#ffffff',
            overflow: 'hidden',
            transition: 'all 0.25s ease',
            boxShadow: expandedPanel === 'remedial' ? '0 8px 30px rgba(0, 133, 219, 0.07)' : '0 2px 6px rgba(0,0,0,0.01)',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary
            expandIcon={<IconChevronDown size={22} style={{ color: expandedPanel === 'remedial' ? '#0085db' : '#94a3b8' }} />}
            sx={{
              p: { xs: 2.25, sm: 2.75 },
              bgcolor: expandedPanel === 'remedial' ? '#fafcff' : '#ffffff',
              borderBottom: expandedPanel === 'remedial' ? '1px solid #edf2f7' : 'none',
              '& .MuiAccordionSummary-content': {
                m: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
              },
            }}
          >
            {/* Header Left: Icon & Titles */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  bgcolor: '#fff0ec',
                  color: '#e07154',
                  p: 1.25,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconAlertTriangle size={24} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#111c2d' }}>
                    Remedial Classes
                  </Typography>
                  <Chip
                    size="small"
                    label={`${student.remedialCourses.length} Backlogs`}
                    sx={{
                      bgcolor: '#fff0ec',
                      color: '#e07154',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      border: '1px solid #fecbc0',
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mt: 0.25 }}>
                  Courses with <strong>F, E, or G Grade</strong> backlogs requiring remedial class attendance to clear exams.
                </Typography>
              </Box>
            </Box>

            {/* Header Right: Grade Chips */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, mr: 2 }}>
              {fCount > 0 && (
                <Chip
                  size="small"
                  label={`F: ${fCount}`}
                  sx={{ bgcolor: '#fff0ec', color: '#e07154', fontWeight: 700, fontSize: '0.72rem' }}
                />
              )}
              {eCount > 0 && (
                <Chip
                  size="small"
                  label={`E: ${eCount}`}
                  sx={{ bgcolor: '#fff8eb', color: '#d68b2c', fontWeight: 700, fontSize: '0.72rem' }}
                />
              )}
              {gCount > 0 && (
                <Chip
                  size="small"
                  label={`G: ${gCount}`}
                  sx={{ bgcolor: '#edf6fc', color: '#0085db', fontWeight: 700, fontSize: '0.72rem' }}
                />
              )}
            </Box>
          </AccordionSummary>

          <AccordionDetails sx={{ p: { xs: 2.5, sm: 3.5 }, bgcolor: '#ffffff' }}>
            <RemedialCourseList
              courses={student.remedialCourses}
              onOpenDetails={onOpenRemedialDetails}
              onOpenRegister={onOpenRemedialRegister}
            />
          </AccordionDetails>
        </Accordion>
      ) : (
        /* PEER TUTOR ACCORDION (Visible ONLY when student has 0 E, F, or G grade backlogs) */
        <Accordion
          expanded={expandedPanel === 'peertutor'}
          onChange={handleChange('peertutor')}
          disableGutters
          elevation={0}
          sx={{
            borderRadius: '16px !important',
            border: '1px solid',
            borderColor: expandedPanel === 'peertutor' ? '#bce1f8' : '#edf2f7',
            bgcolor: '#ffffff',
            overflow: 'hidden',
            transition: 'all 0.25s ease',
            boxShadow: expandedPanel === 'peertutor' ? '0 8px 30px rgba(0, 133, 219, 0.07)' : '0 2px 6px rgba(0,0,0,0.01)',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary
            expandIcon={<IconChevronDown size={22} style={{ color: expandedPanel === 'peertutor' ? '#0085db' : '#94a3b8' }} />}
            sx={{
              p: { xs: 2.25, sm: 2.75 },
              bgcolor: expandedPanel === 'peertutor' ? '#fafcff' : '#ffffff',
              borderBottom: expandedPanel === 'peertutor' ? '1px solid #edf2f7' : 'none',
              '& .MuiAccordionSummary-content': {
                m: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
              },
            }}
          >
            {/* Header Left: Icon & Titles */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  bgcolor: '#e8f8f0',
                  color: '#2e9d64',
                  p: 1.25,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconSchool size={24} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#111c2d' }}>
                    Peer Tutor
                  </Typography>
                  <Chip
                    size="small"
                    label={`${eligibleTutorCount} Eligible Subjects (A+ / O)`}
                    sx={{
                      bgcolor: '#e8f8f0',
                      color: '#2e9d64',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      border: '1px solid #bcead2',
                    }}
                  />
                  {activeTutorCount > 0 && (
                    <Chip
                      size="small"
                      label={`${activeTutorCount} Active Batch`}
                      sx={{
                        bgcolor: '#edf6fc',
                        color: '#0085db',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    />
                  )}
                </Box>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mt: 0.25 }}>
                  Teach junior students in subjects where you secured <strong>Grade A+ or Grade O</strong>. Earn honorarium & mentorship credits!
                </Typography>
              </Box>
            </Box>

            {/* Header Right: Badge */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, mr: 2 }}>
              <Chip
                icon={<IconAward size={15} style={{ color: '#0085db' }} />}
                size="small"
                label="Stipend & Certificate Eligible"
                sx={{ bgcolor: '#f1f5f9', color: '#0085db', fontWeight: 700, fontSize: '0.75rem' }}
              />
            </Box>
          </AccordionSummary>

          <AccordionDetails sx={{ p: { xs: 2.5, sm: 3.5 }, bgcolor: '#ffffff' }}>
            <PeerTutorCourseList
              courses={student.peerTutorCourses || []}
              onOpenApply={onOpenPeerTutorApply}
            />
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
}
