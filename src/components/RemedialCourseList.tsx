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
  IconAlertTriangle,
  IconCalendarEvent,
  IconUser,
  IconEye,
  IconChecklist,
  IconLayoutGrid,
  IconLayoutList,
  IconCircleCheck,
  IconClock,
} from '@tabler/icons-react';
import { RemedialCourse } from '../mock/remedialMockData';

interface RemedialCourseListProps {
  courses: RemedialCourse[];
  onOpenDetails: (course: RemedialCourse) => void;
  onOpenRegister: (course: RemedialCourse) => void;
}

export default function RemedialCourseList({
  courses,
  onOpenDetails,
  onOpenRegister,
}: RemedialCourseListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<'ALL' | 'F' | 'E' | 'G'>('ALL');
  const [viewLayout, setViewLayout] = useState<'table' | 'cards'>('table');

  const filteredCourses = courses.filter((course) => {
    const matchesGrade = gradeFilter === 'ALL' || course.grade === gradeFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      course.courseCode.toLowerCase().includes(q) ||
      course.courseTitle.toLowerCase().includes(q) ||
      course.assignedFaculty.toLowerCase().includes(q) ||
      course.termTaken.toLowerCase().includes(q);

    return matchesGrade && matchesQuery;
  });

  const getGradeChip = (grade: 'F' | 'E' | 'G') => {
    switch (grade) {
      case 'F':
        return (
          <Chip
            size="small"
            label="Grade F • Fail"
            sx={{
              bgcolor: '#fff0ec',
              color: '#d9532f',
              fontWeight: 800,
              fontSize: '0.76rem',
              border: '1px solid #fecbc0',
            }}
          />
        );
      case 'E':
        return (
          <Chip
            size="small"
            label="Grade E • Reappear"
            sx={{
              bgcolor: '#fff8eb',
              color: '#d68b2c',
              fontWeight: 800,
              fontSize: '0.76rem',
              border: '1px solid #fee1b5',
            }}
          />
        );
      case 'G':
        return (
          <Chip
            size="small"
            label="Grade G • Improvement"
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
  };

  const getStatusChip = (status: RemedialCourse['remedialBatchStatus']) => {
    switch (status) {
      case 'Registered':
      case 'In Progress':
        return (
          <Chip
            size="small"
            icon={<IconCircleCheck size={14} style={{ color: '#2e9d64' }} />}
            label={status}
            sx={{ bgcolor: '#e8f8f0', color: '#2e9d64', fontWeight: 700, fontSize: '0.74rem' }}
          />
        );
      case 'Fee Pending':
        return (
          <Chip
            size="small"
            icon={<IconClock size={14} style={{ color: '#d68b2c' }} />}
            label="Fee Pending"
            sx={{ bgcolor: '#fff8eb', color: '#d68b2c', fontWeight: 700, fontSize: '0.74rem' }}
          />
        );
      default:
        return (
          <Chip
            size="small"
            label="Not Registered"
            sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 600, fontSize: '0.74rem' }}
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
        {/* Left: Grade Filter Pills */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mr: 0.5 }}>
            Filter by Grade:
          </Typography>
          {(['ALL', 'F', 'E', 'G'] as const).map((grade) => (
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
                      '&:hover': { bgcolor: '#f0f8ff', color: '#0085db', borderColor: '#bce1f8' },
                    }),
              }}
            >
              {grade === 'ALL'
                ? `All Backlogs (${courses.length})`
                : `Grade ${grade} (${courses.filter((c) => c.grade === grade).length})`}
            </Button>
          ))}
        </Box>

        {/* Right: Search & View Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search remedial course or faculty..."
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
                  <TableCell sx={{ py: 2, fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Course Details</TableCell>
                  <TableCell align="center" sx={{ py: 2, fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Backlog Grade</TableCell>
                  <TableCell align="center" sx={{ py: 2, fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Score Breakdown</TableCell>
                  <TableCell sx={{ py: 2, fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Remedial Batch Schedule</TableCell>
                  <TableCell sx={{ py: 2, fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Assigned Faculty</TableCell>
                  <TableCell align="center" sx={{ py: 2, fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Batch Status</TableCell>
                  <TableCell align="center" sx={{ py: 2, fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        <IconCircleCheck size={48} style={{ color: '#2e9d64' }} />
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#111c2d' }}>
                          {courses.length === 0
                            ? 'No Remedial Backlogs Found!'
                            : 'No backlogs match your selected filter'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 460 }}>
                          {courses.length === 0
                            ? 'Great job! This student has zero E, F, or G grade backlogs. All previous term examinations are fully cleared.'
                            : 'Try selecting a different grade filter or clearing your search keywords.'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map((course) => (
                    <TableRow
                      key={course.id}
                      hover
                      sx={{
                        transition: 'background-color 0.15s ease',
                        '&:hover': { bgcolor: '#f8fafc' },
                      }}
                    >
                      {/* Course Code & Name */}
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
                            <Chip
                              size="small"
                              label={course.courseType}
                              sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#f8fafc', color: '#64748b' }}
                            />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#111c2d' }}>
                            {course.courseTitle}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                            Term: {course.termTaken}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Grade Chip */}
                      <TableCell align="center" sx={{ py: 2.25 }}>
                        {getGradeChip(course.grade)}
                      </TableCell>

                      {/* Score Breakdown */}
                      <TableCell align="center" sx={{ py: 2.25 }}>
                        <Box sx={{ display: 'inline-block', textAlign: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#e07154' }}>
                            {course.totalMarks} / {course.maxMarks}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem', display: 'block' }}>
                            Int: {course.internalMarks} | Ext: {course.externalMarks}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Remedial Slot & Room */}
                      <TableCell sx={{ py: 2.25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <IconCalendarEvent size={16} style={{ color: '#0085db', marginTop: 2, flexShrink: 0 }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#111c2d', fontSize: '0.82rem' }}>
                              {course.remedialSlot}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                              Venue: {course.remedialRoom}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Assigned Faculty */}
                      <TableCell sx={{ py: 2.25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <IconUser size={16} style={{ color: '#64748b', marginTop: 2, flexShrink: 0 }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#111c2d', fontSize: '0.82rem' }}>
                              {course.assignedFaculty}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                              {course.facultyEmail}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Status */}
                      <TableCell align="center" sx={{ py: 2.25 }}>
                        {getStatusChip(course.remedialBatchStatus)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center" sx={{ py: 2.25 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => onOpenDetails(course)}
                            sx={{
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.76rem',
                              borderColor: '#cbd5e1',
                              color: '#475569',
                              textTransform: 'none',
                              '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
                            }}
                          >
                            Details
                          </Button>
                          {course.remedialBatchStatus === 'Not Registered' ? (
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => onOpenRegister(course)}
                              sx={{
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '0.76rem',
                                bgcolor: '#0085db',
                                textTransform: 'none',
                                '&:hover': { bgcolor: '#006cb3' },
                              }}
                            >
                              Register
                            </Button>
                          ) : (
                            <Button
                              variant="outlined"
                              size="small"
                              disabled
                              sx={{
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '0.76rem',
                                textTransform: 'none',
                              }}
                            >
                              Enrolled
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ) : filteredCourses.length === 0 ? (
        /* CARD GRID EMPTY VIEW */
        <Card
          elevation={0}
          sx={{
            p: 6,
            borderRadius: '16px',
            border: '1px solid #edf2f7',
            bgcolor: '#ffffff',
            textAlign: 'center',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            <IconCircleCheck size={48} style={{ color: '#2e9d64' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#111c2d' }}>
              {courses.length === 0 ? 'No Remedial Backlogs Found!' : 'No matching courses found'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              {courses.length === 0
                ? 'Great job! This student has zero E, F, or G grade backlogs. All previous term examinations are fully cleared.'
                : 'Try selecting a different filter or clearing search terms.'}
            </Typography>
          </Box>
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
                  {getGradeChip(course.grade)}
                </Box>

                {/* Score & Status */}
                <Box
                  sx={{
                    bgcolor: '#fafbfd',
                    p: 1.75,
                    borderRadius: '12px',
                    border: '1px solid #edf2f7',
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Previous Score:
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#e07154' }}>
                      {course.totalMarks} / {course.maxMarks} (Int: {course.internalMarks}, Ext: {course.externalMarks})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Batch Status:
                    </Typography>
                    {getStatusChip(course.remedialBatchStatus)}
                  </Box>
                </Box>

                {/* Schedule & Faculty */}
                <Box sx={{ mb: 2.5, flex: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.25 }}>
                    Remedial Batch Timing:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#111c2d', fontSize: '0.84rem' }}>
                    {course.remedialSlot}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                    Faculty: {course.assignedFaculty} • {course.remedialRoom}
                  </Typography>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1.25, mt: 'auto' }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    onClick={() => onOpenDetails(course)}
                    sx={{
                      borderRadius: '8px',
                      fontWeight: 700,
                      borderColor: '#cbd5e1',
                      color: '#475569',
                      textTransform: 'none',
                    }}
                  >
                    Details
                  </Button>
                  {course.remedialBatchStatus === 'Not Registered' ? (
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      onClick={() => onOpenRegister(course)}
                      sx={{
                        borderRadius: '8px',
                        fontWeight: 700,
                        bgcolor: '#0085db',
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#006cb3' },
                      }}
                    >
                      Register
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      disabled
                      sx={{
                        borderRadius: '8px',
                        fontWeight: 700,
                        textTransform: 'none',
                      }}
                    >
                      Enrolled
                    </Button>
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
