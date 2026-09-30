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
  LinearProgress,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  IconSearch,
  IconEye,
  IconLayoutGrid,
  IconLayoutList,
  IconDeviceLaptop,
  IconSparkles,
} from '@tabler/icons-react';
import { TuitionCourse } from '../mock/remedialMockData';

interface TuitionCourseListProps {
  courses: TuitionCourse[];
  onOpenDetails: (course: TuitionCourse) => void;
  onBookDoubtSession: (course: TuitionCourse) => void;
  onOpenGlobalRequest?: () => void;
}

export default function TuitionCourseList({
  courses,
  onOpenDetails,
  onBookDoubtSession,
  onOpenGlobalRequest,
}: TuitionCourseListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | 'BELOW_75' | 'ABOVE_75'>('ALL');
  const [viewLayout, setViewLayout] = useState<'table' | 'cards'>('table');

  const filteredCourses = courses.filter((course) => {
    const matchesAttendance =
      attendanceFilter === 'ALL' ||
      (attendanceFilter === 'BELOW_75' && course.attendancePercentage < 75) ||
      (attendanceFilter === 'ABOVE_75' && course.attendancePercentage >= 75);

    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      course.courseCode.toLowerCase().includes(q) ||
      course.courseTitle.toLowerCase().includes(q) ||
      course.instructor.toLowerCase().includes(q);

    return matchesAttendance && matchesQuery;
  });

  const below75Count = courses.filter((c) => c.attendancePercentage < 75).length;

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
        {/* Left: Attendance Filter Pills & Global Request Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', mr: 0.5 }}>
            Attendance Filter:
          </Typography>
          <Button
            size="small"
            onClick={() => setAttendanceFilter('ALL')}
            sx={{
              fontWeight: 700,
              fontSize: '0.8rem',
              px: 1.75,
              py: 0.6,
              borderRadius: '10px',
              textTransform: 'none',
              transition: 'all 0.2s ease',
              ...(attendanceFilter === 'ALL'
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
            All Courses ({courses.length})
          </Button>

          <Button
            size="small"
            onClick={() => setAttendanceFilter('BELOW_75')}
            sx={{
              fontWeight: 700,
              fontSize: '0.8rem',
              px: 1.75,
              py: 0.6,
              borderRadius: '10px',
              textTransform: 'none',
              transition: 'all 0.2s ease',
              ...(attendanceFilter === 'BELOW_75'
                ? {
                    bgcolor: '#e07154',
                    color: '#ffffff',
                    boxShadow: '0 2px 8px rgba(224, 113, 84, 0.25)',
                    '&:hover': { bgcolor: '#c9593e' },
                  }
                : {
                    bgcolor: '#ffffff',
                    color: below75Count > 0 ? '#e07154' : '#64748b',
                    border: '1px solid #e2e8f0',
                    '&:hover': { bgcolor: '#fff0ec' },
                  }),
            }}
          >
            Below 75% ({below75Count})
          </Button>

          <Button
            size="small"
            onClick={() => setAttendanceFilter('ABOVE_75')}
            sx={{
              fontWeight: 700,
              fontSize: '0.8rem',
              px: 1.75,
              py: 0.6,
              borderRadius: '10px',
              textTransform: 'none',
              transition: 'all 0.2s ease',
              ...(attendanceFilter === 'ABOVE_75'
                ? {
                    bgcolor: '#2e9d64',
                    color: '#ffffff',
                    boxShadow: '0 2px 8px rgba(46, 157, 100, 0.25)',
                    '&:hover': { bgcolor: '#248252' },
                  }
                : {
                    bgcolor: '#ffffff',
                    color: '#64748b',
                    border: '1px solid #e2e8f0',
                    '&:hover': { bgcolor: '#e8f8f0', color: '#2e9d64' },
                  }),
            }}
          >
            Safe Attendance ≥75% ({courses.length - below75Count})
          </Button>
        </Box>

        {/* Right: Global Request Button, Search & View Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {onOpenGlobalRequest && (
            <Button
              variant="contained"
              size="small"
              onClick={onOpenGlobalRequest}
              startIcon={<IconSparkles size={16} />}
              sx={{
                bgcolor: '#0085db',
                fontWeight: 700,
                fontSize: '0.8rem',
                borderRadius: '10px',
                px: 2,
                py: 0.7,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(0, 133, 219, 0.2)',
                '&:hover': { bgcolor: '#006cb3' },
              }}
            >
              Request Tuition for Any Subject
            </Button>
          )}

          <TextField
            size="small"
            placeholder="Search ongoing course..."
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
              width: { xs: '100%', sm: '210px' },
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
                  <TableCell sx={{ py: 2, fontWeight: 700, color: '#475569', fontSize: '0.8rem', minWidth: 240 }}>Attendance Status</TableCell>
                  <TableCell align="center" sx={{ py: 2, fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCourses.map((course) => {
                  const isLowAtt = course.attendancePercentage < 75;
                  return (
                    <TableRow
                      key={course.id}
                      hover
                      sx={{
                        transition: 'background-color 0.15s ease',
                        '&:hover': { bgcolor: '#f8fafc' },
                      }}
                    >
                      {/* Course Info */}
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
                        </Box>
                      </TableCell>

                      {/* Attendance Bar */}
                      <TableCell sx={{ minWidth: 240, py: 2.25 }}>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 800,
                                color: isLowAtt ? '#e07154' : '#2e9d64',
                              }}
                            >
                              {course.attendancePercentage}% Attendance
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.74rem' }}>
                              {course.attendedLectures} / {course.totalLectures} Classes Attended
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(course.attendancePercentage, 100)}
                            sx={{
                              height: 7,
                              borderRadius: 3.5,
                              bgcolor: '#edf2f7',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: isLowAtt ? '#fb977d' : '#4bd08b',
                              },
                            }}
                          />
                        </Box>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center" sx={{ py: 2.25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<IconEye size={15} />}
                            onClick={() => onOpenDetails(course)}
                            sx={{
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.76rem',
                              borderColor: '#cbd5e1',
                              color: '#475569',
                              textTransform: 'none',
                              '&:hover': { borderColor: '#0085db', color: '#0085db', bgcolor: '#f0f8ff' },
                            }}
                          >
                            Details
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<IconDeviceLaptop size={15} />}
                            onClick={() => onBookDoubtSession(course)}
                            sx={{
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.76rem',
                              bgcolor: '#0085db',
                              textTransform: 'none',
                              '&:hover': { bgcolor: '#006cb3' },
                            }}
                          >
                            Register Support
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ) : (
        /* CARD GRID VIEW */
        <Grid container spacing={2.5}>
          {filteredCourses.map((course) => {
            const isLowAtt = course.attendancePercentage < 75;
            return (
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
                    <Chip
                      size="small"
                      label={course.courseType}
                      sx={{ bgcolor: '#f1f5f9', fontWeight: 600, fontSize: '0.72rem' }}
                    />
                  </Box>

                  {/* Attendance Bar */}
                  <Box sx={{ mb: 3, bgcolor: '#fafbfd', p: 1.75, borderRadius: '12px', border: '1px solid #edf2f7' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Attendance:
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 800, color: isLowAtt ? '#e07154' : '#2e9d64' }}
                      >
                        {course.attendancePercentage}% ({course.attendedLectures}/{course.totalLectures} L)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(course.attendancePercentage, 100)}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: '#edf2f7',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: isLowAtt ? '#fb977d' : '#4bd08b',
                        },
                      }}
                    />
                  </Box>

                  {/* Action Buttons */}
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
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      startIcon={<IconDeviceLaptop size={15} />}
                      onClick={() => onBookDoubtSession(course)}
                      sx={{
                        borderRadius: '8px',
                        fontWeight: 700,
                        bgcolor: '#0085db',
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#006cb3' },
                      }}
                    >
                      Register Support
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
