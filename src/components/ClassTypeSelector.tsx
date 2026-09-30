'use client';

import React from 'react';
import {
  Card,
  Box,
  Typography,
  Radio,
  Chip,
  Grid,
  Button,
} from '@mui/material';
import {
  IconAlertTriangle,
  IconBooks,
  IconSparkles,
} from '@tabler/icons-react';

export type ClassType = 'remedial' | 'tuition';

interface ClassTypeSelectorProps {
  selectedType: ClassType;
  onChange: (type: ClassType) => void;
  remedialCount: number;
  tuitionCount: number;
  onOpenGlobalRequest?: () => void;
}

export default function ClassTypeSelector({
  selectedType,
  onChange,
  remedialCount,
  tuitionCount,
  onOpenGlobalRequest,
}: ClassTypeSelectorProps) {
  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e5eaef',
        p: { xs: 2, sm: 2.5 },
        mb: 3,
      }}
    >
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#111c2d', mb: 0.5 }}>
            Select Class Category
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Choose between remedial backlog clearance classes or ongoing regular tuition classes.
          </Typography>
        </Box>

        {/* Global Request Button */}
        {onOpenGlobalRequest && (
          <Button
            variant="contained"
            onClick={onOpenGlobalRequest}
            startIcon={<IconSparkles size={18} />}
            sx={{
              bgcolor: '#0085db',
              fontWeight: 700,
              fontSize: '0.82rem',
              borderRadius: '10px',
              px: 2,
              py: 0.9,
              boxShadow: '0 4px 14px rgba(0, 133, 219, 0.25)',
              '&:hover': { bgcolor: '#006cb3' },
            }}
          >
            Request Tuition for Any Subject
          </Button>
        )}
      </Box>

      {/* 2 Option Radio Interactive Selector Cards */}
      <Grid container spacing={2}>
        {/* OPTION 1: Remedial Classes Radio Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            onClick={() => onChange('remedial')}
            sx={{
              p: 2.5,
              borderRadius: '14px',
              border: '2px solid',
              borderColor: selectedType === 'remedial' ? '#0085db' : '#e2e8f0',
              bgcolor: selectedType === 'remedial' ? '#f0f8ff' : '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow:
                selectedType === 'remedial'
                  ? '0 6px 20px rgba(0, 133, 219, 0.12)'
                  : '0 2px 6px rgba(0,0,0,0.02)',
              '&:hover': {
                borderColor: selectedType === 'remedial' ? '#0085db' : '#cbd5e1',
                bgcolor: selectedType === 'remedial' ? '#f0f8ff' : '#f8fafc',
              },
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
            }}
          >
            <Radio
              checked={selectedType === 'remedial'}
              onChange={() => onChange('remedial')}
              value="remedial"
              name="class-type-radio"
              sx={{
                p: 0,
                mt: 0.25,
                color: '#94a3b8',
                '&.Mui-checked': {
                  color: '#0085db',
                },
              }}
            />

            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      bgcolor: selectedType === 'remedial' ? '#0085db' : '#f1f5f9',
                      color: selectedType === 'remedial' ? '#ffffff' : '#64748b',
                      p: 0.75,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconAlertTriangle size={18} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      color: selectedType === 'remedial' ? '#0085db' : '#111c2d',
                    }}
                  >
                    Remedial Classes
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  label={`${remedialCount} Backlogs`}
                  sx={{
                    bgcolor: selectedType === 'remedial' ? '#ffede9' : '#f1f5f9',
                    color: selectedType === 'remedial' ? '#e07154' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    border: '1px solid',
                    borderColor: selectedType === 'remedial' ? '#fb977d' : '#e2e8f0',
                  }}
                />
              </Box>

              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, lineHeight: 1.4, mb: 1 }}>
                View & register for subjects with <strong>F, E, or G Grade</strong> backlogs to clear examination eligibility.
              </Typography>

              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                <Chip size="small" label="Grade F: Fail" sx={{ height: 22, fontSize: '0.7rem', bgcolor: '#ffede9', color: '#e07154', fontWeight: 600 }} />
                <Chip size="small" label="Grade E: Reappear" sx={{ height: 22, fontSize: '0.7rem', bgcolor: '#fff6ea', color: '#df9e4c', fontWeight: 600 }} />
                <Chip size="small" label="Grade G: Improvement" sx={{ height: 22, fontSize: '0.7rem', bgcolor: '#f0f5f9', color: '#475569', fontWeight: 600 }} />
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* OPTION 2: Tuition Classes Radio Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            onClick={() => onChange('tuition')}
            sx={{
              p: 2.5,
              borderRadius: '14px',
              border: '2px solid',
              borderColor: selectedType === 'tuition' ? '#0085db' : '#e2e8f0',
              bgcolor: selectedType === 'tuition' ? '#f0f8ff' : '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow:
                selectedType === 'tuition'
                  ? '0 6px 20px rgba(0, 133, 219, 0.12)'
                  : '0 2px 6px rgba(0,0,0,0.02)',
              '&:hover': {
                borderColor: selectedType === 'tuition' ? '#0085db' : '#cbd5e1',
                bgcolor: selectedType === 'tuition' ? '#f0f8ff' : '#f8fafc',
              },
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
            }}
          >
            <Radio
              checked={selectedType === 'tuition'}
              onChange={() => onChange('tuition')}
              value="tuition"
              name="class-type-radio"
              sx={{
                p: 0,
                mt: 0.25,
                color: '#94a3b8',
                '&.Mui-checked': {
                  color: '#0085db',
                },
              }}
            />

            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      bgcolor: selectedType === 'tuition' ? '#0085db' : '#f1f5f9',
                      color: selectedType === 'tuition' ? '#ffffff' : '#64748b',
                      p: 0.75,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconBooks size={18} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      color: selectedType === 'tuition' ? '#0085db' : '#111c2d',
                    }}
                  >
                    Tuition Classes (Current Semester)
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  label={`${tuitionCount} Ongoing`}
                  sx={{
                    bgcolor: selectedType === 'tuition' ? '#e5f3fb' : '#f1f5f9',
                    color: selectedType === 'tuition' ? '#0085db' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    border: '1px solid',
                    borderColor: selectedType === 'tuition' ? '#bce1f8' : '#e2e8f0',
                  }}
                />
              </Box>

              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, lineHeight: 1.4, mb: 1 }}>
                View your <strong>Current Semester Ongoing Courses</strong>, live attendance tracking, class timetable, and extra tuition sessions.
              </Typography>

              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                <Chip size="small" label="Live Attendance %" sx={{ height: 22, fontSize: '0.7rem', bgcolor: '#dffff3', color: '#38b273', fontWeight: 600 }} />
                <Chip size="small" label="Continuous Assessment" sx={{ height: 22, fontSize: '0.7rem', bgcolor: '#e5f3fb', color: '#0085db', fontWeight: 600 }} />
                <Chip size="small" label="Doubt Sessions" sx={{ height: 22, fontSize: '0.7rem', bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600 }} />
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
}
