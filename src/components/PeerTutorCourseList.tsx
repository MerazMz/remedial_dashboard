'use client';

import React, { useState } from 'react';
import {
  Card,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  IconSearch,
  IconAward,
  IconUserStar,
  IconCircleCheck,
  IconClock,
  IconLayoutGrid,
  IconLayoutList,
  IconChecklist,
  IconCalendarEvent,
  IconSparkles,
} from '@tabler/icons-react';
import { PeerTutorCourse } from '../mock/remedialMockData';

interface PeerTutorCourseListProps {
  courses: PeerTutorCourse[];
  onOpenApply: (course: PeerTutorCourse) => void;
}

export default function PeerTutorCourseList({
  courses,
  onOpenApply,
}: PeerTutorCourseListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<'ALL' | 'O' | 'A+'>('ALL');
  const [viewLayout, setViewLayout] = useState<'table' | 'cards'>('table');

  const filteredCourses = courses.filter((course) => {
    const matchesGrade =
      gradeFilter === 'ALL' ||
      (gradeFilter === 'O' && course.grade === 'O') ||
      (gradeFilter === 'A+' && course.grade === 'A+');

    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      course.courseCode.toLowerCase().includes(q) ||
      course.courseTitle.toLowerCase().includes(q) ||
      course.termTaken.toLowerCase().includes(q);

    return matchesGrade && matchesQuery;
  });

  const getGradeChip = (grade: 'O' | 'A+' | 'A') => {
    if (grade === 'O') {
      return (
        <Chip
          size="small"
          icon={<IconAward size={14} style={{ color: '#0085db' }} />}
          label="Grade O • Outstanding (90%+)"
          sx={{
            bgcolor: '#edf6fc',
            color: '#0085db',
            fontWeight: 800,
            fontSize: '0.76rem',
            border: '1px solid #c7e5f9',
          }}
        />
      );
    }
    return (
      <Chip
        size="small"
        icon={<IconSparkles size={14} style={{ color: '#2e9d64' }} />}
        label="Grade A+ • Excellent Achievement"
        sx={{
          bgcolor: '#e8f8f0',
          color: '#2e9d64',
          fontWeight: 800,
          fontSize: '0.76rem',
          border: '1px solid #bcead2',
        }}
      />
    );
  };

  const getStatusChip = (status: PeerTutorCourse['tutorStatus']) => {
    switch (status) {
      case 'Active Tutor':
        return (
          <Chip
            size="small"
            icon={<IconCircleCheck size={14} style={{ color: '#2e9d64' }} />}
            label="Active Tutor"
            sx={{ bgcolor: '#e8f8f0', color: '#2e9d64', fontWeight: 800, fontSize: '0.74rem' }}
          />
        );
      case 'Application Submitted':
        return (
          <Chip
            size="small"
            icon={<IconClock size={14} style={{ color: '#d68b2c' }} />}
            label="Application Under Review"
            sx={{ bgcolor: '#fff8eb', color: '#d68b2c', fontWeight: 700, fontSize: '0.74rem' }}
          />
        );
      default:
        return (
          <Chip
            size="small"
            label="Eligible to Teach"
            sx={{ bgcolor: '#f1f5f9', color: '#0085db', fontWeight: 700, fontSize: '0.74rem', border: '1px solid #c7e5f9' }}
          />
        );
    }
  };

  return (
    <Box>
      {/* Spacious Clean Filter & Search Toolbar */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {/* Left: Grade Filter Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mr: 0.5 }}>
            Filter by Mastery Grade:
          </Typography>
          {(['ALL', 'O', 'A+'] as const).map((grade) => (
            <Button
              key={grade}
              size="small"
              onClick={() => setGradeFilter(grade)}
              sx={{
                fontWeight: 700,
                fontSize: '0.8rem',
                px: 1.75,
                py: 0.6,
                borderRadius: '10px',
                textTransform: 'none',
                transition: 'all 0.2s ease',
                ...(gradeFilter === grade
                  ? {
                      bgcolor: '#0085db',
                      color: '#ffffff',
                      boxShadow: '0 2px 8px rgba(0, 133, 219, 0.25)',
                      '&:hover': { bgcolor: '#006cb3' },
                    }
                  : {
                      bgcolor: '#ffffff',
                      color: '#64748b',
                      border: '1px solid #e2e8f0',
                      '&:hover': { bgcolor: '#f0f8ff', color: '#0085db' },
                    }),
              }}
            >
              {grade === 'ALL' ? `All Eligible (${courses.length})` : `Grade ${grade} Only`}
            </Button>
          ))}
        </Box>

        {/* Right: Search & View Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search eligible subject or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={16} color="#7c8fac" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              width: { xs: '100%', sm: '260px' },
              '& .MuiOutlinedInput-root': {
                bgcolor: '#ffffff',
                borderRadius: '10px',
                fontSize: '0.86rem',
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#cbd5e1' },
              },
            }}
          />

          <ToggleButtonGroup
            value={viewLayout}
            exclusive
            onChange={(e, val) => {
              if (val) setViewLayout(val);
            }}
            size="small"
            sx={{
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              '& .MuiToggleButton-root': {
                border: 'none',
                px: 1.5,
                py: 0.6,
                color: '#64748b',
                '&.Mui-selected': {
                  bgcolor: '#0085db',
                  color: '#ffffff',
                },
              },
            }}
          >
            <ToggleButton value="table">
              <IconLayoutList size={18} />
            </ToggleButton>
            <ToggleButton value="cards">
              <IconLayoutGrid size={18} />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Main Content Area */}
      {viewLayout === 'table' ? (
        /* TABULAR VIEW */
        <Card
          elevation={0}
          sx={{
            borderRadius: '16px',
            border: '1px solid #edf2f7',
            bgcolor: '#ffffff',
            overflow: 'hidden',
          }}
        >
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#fafbfd' }}>
                  <TableCell sx={{ py: 2, fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Eligible Subject & Code</TableCell>
                  <TableCell align="center" sx={{ py: 2, fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Secured Grade</TableCell>
                  <TableCell align="center" sx={{ py: 2, fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Term Taken & Score</TableCell>
                  <TableCell align="center" sx={{ py: 2, fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Honorarium / Rate</TableCell>
                  <TableCell sx={{ py: 2, fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Teaching Preference / Slot</TableCell>
                  <TableCell align="center" sx={{ py: 2, fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Tutor Status</TableCell>
                  <TableCell align="center" sx={{ py: 2, fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow
                    key={course.id}
                    hover
                    sx={{
                      transition: 'background-color 0.15s ease',
                      '&:hover': { bgcolor: '#f8fafc' },
                    }}
                  >
                    {/* Course Details */}
                    <TableCell sx={{ py: 2.25 }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0085db' }}>
                            {course.courseCode}
                          </Typography>
                          <Chip
                            size="small"
                            label={`${course.credits} Credits`}
                            sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#f1f5f9', fontWeight: 600 }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#111c2d' }}>
                          {course.courseTitle}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Grade Chip */}
                    <TableCell align="center" sx={{ py: 2.25 }}>{getGradeChip(course.grade)}</TableCell>

                    {/* Term & Score */}
                    <TableCell align="center" sx={{ py: 2.25 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#2e9d64' }}>
                        {course.marksObtained} / {course.maxMarks} Marks
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {course.termTaken}
                      </Typography>
                    </TableCell>

                    {/* Honorarium */}
                    <TableCell align="center" sx={{ py: 2.25 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#111c2d' }}>
                        ₹{course.hourlyHonorarium} / hr
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        + Certificate
                      </Typography>
                    </TableCell>

                    {/* Preference & Slot */}
                    <TableCell sx={{ py: 2.25 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <IconCalendarEvent size={15} style={{ color: '#0085db' }} />
                          <Typography variant="caption" sx={{ fontWeight: 600, color: '#111c2d' }}>
                            {course.preferredSlot || 'Flexible Slots Available'}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Mode: {course.preferredMode || 'Online (Google Meet)'}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Status */}
                    <TableCell align="center" sx={{ py: 2.25 }}>{getStatusChip(course.tutorStatus)}</TableCell>

                    {/* Action Button */}
                    <TableCell align="center" sx={{ py: 2.25 }}>
                      <Button
                        variant={course.tutorStatus === 'Active Tutor' ? 'outlined' : 'contained'}
                        size="small"
                        startIcon={course.tutorStatus === 'Active Tutor' ? <IconUserStar size={15} /> : <IconChecklist size={15} />}
                        onClick={() => onOpenApply(course)}
                        sx={{
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.76rem',
                          textTransform: 'none',
                          ...(course.tutorStatus === 'Active Tutor'
                            ? { borderColor: '#2e9d64', color: '#2e9d64', '&:hover': { bgcolor: '#e8f8f0' } }
                            : { bgcolor: '#0085db', '&:hover': { bgcolor: '#006cb3' } }),
                        }}
                      >
                        {course.tutorStatus === 'Active Tutor' ? 'Manage Batch' : course.tutorStatus === 'Application Submitted' ? 'Update Slots' : 'Apply as Tutor'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ) : (
        /* CARD GRID VIEW */
        <Grid container spacing={2.5}>
          {filteredCourses.map((course) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={course.id}>
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  border: '1px solid #edf2f7',
                  bgcolor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                    borderColor: '#0085db',
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#0085db', fontSize: '0.8rem' }}>
                      {course.courseCode} • {course.credits} Credits
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#111c2d', mt: 0.25 }}>
                      {course.courseTitle}
                    </Typography>
                  </Box>
                  {getStatusChip(course.tutorStatus)}
                </Box>

                {/* Grade and Score Box */}
                <Box
                  sx={{
                    bgcolor: '#fafbfd',
                    p: 1.75,
                    borderRadius: '12px',
                    border: '1px solid #edf2f7',
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Secured Grade:
                    </Typography>
                    {getGradeChip(course.grade)}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Academic Score:
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#2e9d64' }}>
                      {course.marksObtained} / {course.maxMarks} Marks ({course.termTaken})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Tutor Honorarium:
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#111c2d' }}>
                      ₹{course.hourlyHonorarium} / hr
                    </Typography>
                  </Box>
                </Box>

                {/* Timing / Mode */}
                <Box sx={{ mb: 2.5, flex: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.25 }}>
                    Tutoring Availability:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#111c2d', fontSize: '0.84rem' }}>
                    {course.preferredSlot || 'Weekday Evenings / Weekends'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Mode: {course.preferredMode || 'Online (Google Meet)'}
                  </Typography>
                </Box>

                {/* Action */}
                <Button
                  fullWidth
                  variant={course.tutorStatus === 'Active Tutor' ? 'outlined' : 'contained'}
                  size="small"
                  onClick={() => onOpenApply(course)}
                  sx={{
                    borderRadius: '8px',
                    fontWeight: 700,
                    textTransform: 'none',
                    mt: 'auto',
                    ...(course.tutorStatus === 'Active Tutor'
                      ? { borderColor: '#2e9d64', color: '#2e9d64', '&:hover': { bgcolor: '#e8f8f0' } }
                      : { bgcolor: '#0085db', '&:hover': { bgcolor: '#006cb3' } }),
                  }}
                >
                  {course.tutorStatus === 'Active Tutor' ? 'Manage Teaching Batch' : 'Apply as Peer Tutor'}
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
