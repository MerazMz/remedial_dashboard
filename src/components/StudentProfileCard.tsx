'use client';

import React from 'react';
import {
  Card,
  Box,
  Typography,
  Avatar,
  Chip,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { IconAward, IconCheck } from '@tabler/icons-react';
import { StudentProfile } from '../mock/remedialMockData';

interface StudentProfileCardProps {
  students: StudentProfile[];
  selectedStudent: StudentProfile;
  onSelectStudent: (student: StudentProfile) => void;
}

export default function StudentProfileCard({
  students,
  selectedStudent,
  onSelectStudent,
}: StudentProfileCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #edf2f7',
        p: { xs: 2.5, sm: 3 },
        mb: 3,
      }}
    >
      <Grid container spacing={3} sx={{ alignItems: 'center' }}>
        {/* Left: Avatar & Info */}
        <Grid size={{ xs: 12, md: students && students.length > 1 ? 8 : 8 }}>
          <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2.5 }}>
            <Avatar
              src={selectedStudent.avatar}
              alt={selectedStudent.name}
              sx={{
                width: { xs: 60, sm: 68 },
                height: { xs: 60, sm: 68 },
                border: '3px solid #edf6fc',
                boxShadow: '0 4px 14px rgba(0, 133, 219, 0.12)',
              }}
            />
            <Box sx={{ flex: 1 }}>
              {/* Name, Semester, Section, and Current CGPA */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap', mb: 0.75 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#111c2d' }}>
                  {selectedStudent.name}
                </Typography>
                <Chip
                  size="small"
                  label={`Semester ${selectedStudent.currentSemester}`}
                  sx={{
                    bgcolor: '#edf6fc',
                    color: '#0085db',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}
                />
                <Chip
                  size="small"
                  label={`Sec: ${selectedStudent.section}`}
                  sx={{
                    bgcolor: '#f1f5f9',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                />
                <Chip
                  icon={<IconAward size={14} style={{ color: '#2e9d64' }} />}
                  size="small"
                  label={`Current CGPA: ${selectedStudent.cgpa.toFixed(2)}`}
                  sx={{
                    bgcolor: '#e8f8f0',
                    color: '#2e9d64',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    border: '1px solid #bcead2',
                  }}
                />
              </Box>

              <Typography
                variant="body2"
                sx={{ color: '#64748b', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
              >
                <span><strong>Reg No:</strong> {selectedStudent.registrationNo}</span>
                <span>•</span>
                <span><strong>Roll:</strong> {selectedStudent.rollNo}</span>
                <span>•</span>
                <span>{selectedStudent.program}</span>
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Right: Switch Mock Student Selector or Status Badge */}
        <Grid size={{ xs: 12, md: 4 }}>
          {students && students.length > 1 ? (
            <Box
              sx={{
                bgcolor: '#fafbfd',
                p: 1.75,
                borderRadius: '12px',
                border: '1px solid #edf2f7',
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel id="student-switcher-label" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Switch Student Profile
                </InputLabel>
                <Select
                  labelId="student-switcher-label"
                  value={selectedStudent.registrationNo}
                  label="Switch Student Profile"
                  onChange={(e) => {
                    const std = students.find((s) => s.registrationNo === e.target.value);
                    if (std) onSelectStudent(std);
                  }}
                  sx={{
                    bgcolor: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                    '& fieldset': { borderColor: '#e2e8f0' },
                  }}
                >
                  {students.map((std) => (
                    <MenuItem key={std.registrationNo} value={std.registrationNo} sx={{ py: 1 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            {std.name}
                          </Typography>
                          <Chip
                            size="small"
                            label={std.isEligibleForRemedial ? 'Remedial' : 'Peer Tutor'}
                            sx={{
                              height: 20,
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              bgcolor: std.isEligibleForRemedial ? '#fff0ec' : '#f0fdf4',
                              color: std.isEligibleForRemedial ? '#e07154' : '#16a34a',
                            }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                          Reg: {std.registrationNo} • {std.program.split('(')[0].trim()} • CGPA: {std.cgpa.toFixed(2)}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          ) : (
            <Box
              sx={{
                bgcolor: '#fafbfd',
                p: 2,
                borderRadius: '12px',
                border: '1px solid #edf2f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                gap: 1.5,
              }}
            >
              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                  Academic Support Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                  <IconCheck size={16} color="#2e9d64" />
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#111c2d' }}>
                    Enrolled & Active
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
    </Card>
  );
}
