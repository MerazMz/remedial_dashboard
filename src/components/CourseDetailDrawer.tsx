'use client';

import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Chip,
  Grid,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  IconX,
  IconCalendarEvent,
  IconUser,
  IconMail,
  IconClock,
  IconCircleCheck,
  IconCheck,
  IconSchool,
} from '@tabler/icons-react';
import { RemedialCourse, TuitionCourse } from '../mock/remedialMockData';

interface CourseDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  course: RemedialCourse | TuitionCourse | null;
  type: 'remedial' | 'tuition';
  onRegisterRemedial?: (course: RemedialCourse) => void;
}

export default function CourseDetailDrawer({
  open,
  onClose,
  course,
  type,
  onRegisterRemedial,
}: CourseDetailDrawerProps) {
  if (!course) return null;

  // Determine course type reliably by inspecting properties on the course itself
  const isRemedial = 'grade' in course || type === 'remedial';
  const remCourse = course as Partial<RemedialCourse>;
  const tuiCourse = course as Partial<TuitionCourse>;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 460, md: 520 },
            p: 0,
            bgcolor: '#ffffff',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: '1px solid #e5eaef',
          bgcolor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#0085db', fontSize: '0.8rem' }}>
            {isRemedial ? 'REMEDIAL COURSE DETAILS' : 'CURRENT SEMESTER TUITION COURSE'}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#111c2d', mt: 0.25 }}>
            {course.courseCode}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            '&:hover': { bgcolor: '#f1f5f9' },
          }}
        >
          <IconX size={20} />
        </IconButton>
      </Box>

      {/* Content Body */}
      <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
        {/* Title & Type */}
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#111c2d', mb: 1 }}>
          {course.courseTitle}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          <Chip
            label={`${course.credits} Credits`}
            sx={{ bgcolor: '#e5f3fb', color: '#0085db', fontWeight: 700, fontSize: '0.75rem' }}
          />
          <Chip
            label={course.courseType}
            sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}
          />
          {isRemedial && remCourse.grade && (
            <Chip
              label={`Obtained Grade: ${remCourse.grade}`}
              sx={{
                bgcolor: remCourse.grade === 'F' ? '#ffede9' : remCourse.grade === 'E' ? '#fff6ea' : '#e5f3fb',
                color: remCourse.grade === 'F' ? '#e07154' : remCourse.grade === 'E' ? '#df9e4c' : '#0085db',
                fontWeight: 800,
                fontSize: '0.75rem',
              }}
            />
          )}
        </Box>

        {/* Remedial Specific Stats */}
        {isRemedial && remCourse.grade ? (
          <>
            <Box
              sx={{
                bgcolor: '#f8fafc',
                p: 2,
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                mb: 3,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#111c2d', mb: 1.5 }}>
                Previous Evaluation Record
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Term Taken:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{remCourse.termTaken || '--'}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Attempts Left:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#e07154' }}>
                    {remCourse.attemptsLeft ?? '--'} Attempts
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Internal Marks:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{remCourse.internalMarks ?? 0} / 50</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>End Term Marks:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{remCourse.externalMarks ?? 0} / 50</Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Remedial Batch Info */}
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#111c2d', mb: 1 }}>
              Remedial Batch Schedule
            </Typography>
            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                mb: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <IconCalendarEvent size={18} style={{ color: '#0085db' }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#111c2d' }}>
                  {remCourse.remedialSlot || 'Schedule to be announced'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <IconSchool size={18} style={{ color: '#7c8fac' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Venue: {remCourse.remedialRoom || 'Main Campus'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconClock size={18} style={{ color: '#df9e4c' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Mandatory Attendance: <strong>75% minimum</strong>
                </Typography>
              </Box>
            </Box>

            {/* Syllabus Topics Covered */}
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#111c2d', mb: 1 }}>
              Remedial Syllabus Modules
            </Typography>
            <List sx={{ mb: 3, p: 0 }}>
              {(remCourse.syllabusTopics || []).map((topic, idx) => (
                <ListItem
                  key={idx}
                  sx={{
                    px: 1.5,
                    py: 1,
                    mb: 1,
                    borderRadius: '8px',
                    bgcolor: '#f8fafc',
                    border: '1px solid #edf2f7',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    {topic.status === 'Completed' ? (
                      <IconCircleCheck size={18} style={{ color: '#38b273' }} />
                    ) : (
                      <IconCheck size={18} style={{ color: '#94a3b8' }} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#111c2d' }}>
                        {topic.title}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {topic.hours} Hours • Status: {topic.status}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
              {(!remCourse.syllabusTopics || remCourse.syllabusTopics.length === 0) && (
                <Typography variant="body2" sx={{ color: 'text.secondary', p: 1 }}>
                  Detailed syllabus topics will be shared in the first session.
                </Typography>
              )}
            </List>
          </>
        ) : (
          /* Tuition Specific Stats */
          <>
            <Box
              sx={{
                bgcolor: '#f8fafc',
                p: 2,
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                mb: 3,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#111c2d', mb: 1.5 }}>
                Current Term Progress & Attendance
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Attendance: {tuiCourse.attendancePercentage ?? 0}%
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {tuiCourse.attendedLectures ?? 0} of {tuiCourse.totalLectures ?? 0} lectures
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(tuiCourse.attendancePercentage ?? 0, 100)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#e2e8f0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: (tuiCourse.attendancePercentage ?? 0) < 75 ? '#fb977d' : '#4bd08b',
                    },
                  }}
                />
              </Box>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Continuous Assessment:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {tuiCourse.caMarksObtained ?? 0} / {tuiCourse.caMaxMarks ?? 30} Marks
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Mid-Term Score:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {tuiCourse.midtermMarks || '--'} / {tuiCourse.midtermMaxMarks || 50}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Syllabus Delivered:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{tuiCourse.syllabusProgress ?? 0}%</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Next Lecture Topic:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0085db' }}>
                    {tuiCourse.nextClassTopic || 'Regular Class Session'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Weekly Schedule */}
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#111c2d', mb: 1 }}>
              Timetable & Venue
            </Typography>
            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                mb: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <IconCalendarEvent size={18} style={{ color: '#0085db' }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#111c2d' }}>
                  {tuiCourse.weeklySchedule || 'Regular Timetable Slot'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconSchool size={18} style={{ color: '#7c8fac' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Classroom / Lab: {tuiCourse.roomNo || 'Main Academic Block'}
                </Typography>
              </Box>
            </Box>
          </>
        )}

        {/* Assigned Faculty Card */}
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#111c2d', mb: 1 }}>
          Course Instructor & Contact
        </Typography>
        <Box
          sx={{
            p: 2,
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            bgcolor: '#f8fafc',
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              p: 1.25,
              borderRadius: '10px',
              bgcolor: '#e5f3fb',
              color: '#0085db',
              display: 'flex',
            }}
          >
            <IconUser size={24} />
          </Box>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 800, color: '#111c2d' }}>
              {isRemedial ? remCourse.assignedFaculty : tuiCourse.instructor}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconMail size={14} /> {isRemedial ? remCourse.facultyEmail : tuiCourse.instructorEmail}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Drawer Footer Actions */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid #e5eaef',
          bgcolor: '#ffffff',
          display: 'flex',
          gap: 1.5,
        }}
      >
        <Button fullWidth variant="outlined" onClick={onClose} sx={{ fontWeight: 700 }}>
          Close
        </Button>
        {isRemedial && onRegisterRemedial && (
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              onClose();
              if (course && 'grade' in course) {
                onRegisterRemedial(course as RemedialCourse);
              }
            }}
            sx={{
              fontWeight: 700,
              bgcolor: '#0085db',
              '&:hover': { bgcolor: '#006cb3' },
            }}
          >
            {remCourse.remedialBatchStatus === 'Registered' ? 'Manage Batch' : 'Register for Remedial'}
          </Button>
        )}
      </Box>
    </Drawer>
  );
}
