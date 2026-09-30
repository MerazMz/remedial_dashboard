'use client';

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  Autocomplete,
  RadioGroup,
  Radio,
  Chip,
  Grid,
  Divider,
  Alert,
} from '@mui/material';
import {
  IconSchool,
  IconVideo,
  IconBooks,
  IconCircleCheck,
  IconHelpCircle,
  IconSparkles,
  IconSearch,
  IconAlertCircle,
  IconHistory,
  IconSend,
} from '@tabler/icons-react';
import confetti from 'canvas-confetti';
import { StudentProfile, AcademicHistoryCourse } from '../mock/remedialMockData';

interface GlobalTuitionRequestDialogProps {
  open: boolean;
  onClose: () => void;
  student: StudentProfile;
  onSubmitSuccess: (courseCode: string, supportType: string) => void;
}

export default function GlobalTuitionRequestDialog({
  open,
  onClose,
  student,
  onSubmitSuccess,
}: GlobalTuitionRequestDialogProps) {
  const [selectedCourseInput, setSelectedCourseInput] = useState<AcademicHistoryCourse | string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [supportType, setSupportType] = useState<'online_classes' | 'study_material'>('online_classes');
  const [reason, setReason] = useState<string>('grade_improvement');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Find matching academic course record from student's history
  const matchedCourse: AcademicHistoryCourse | null = useMemo(() => {
    if (!selectedCourseInput && !inputValue) return null;

    if (typeof selectedCourseInput === 'object' && selectedCourseInput !== null) {
      return selectedCourseInput;
    }

    const searchKey = (inputValue || '').toLowerCase().trim();
    if (!searchKey) return null;

    return (
      student.academicHistory.find(
        (c) =>
          c.courseCode.toLowerCase() === searchKey ||
          c.courseCode.toLowerCase().includes(searchKey) ||
          c.courseTitle.toLowerCase().includes(searchKey)
      ) || null
    );
  }, [selectedCourseInput, inputValue, student.academicHistory]);

  const getGradeChip = (grade?: string) => {
    if (!grade) return null;
    const g = grade.toUpperCase();
    if (g === 'F') {
      return (
        <Chip
          size="small"
          label="Grade F • Fail / Backlog"
          sx={{ bgcolor: '#ffede9', color: '#e07154', fontWeight: 800, border: '1px solid #fb977d' }}
        />
      );
    }
    if (g === 'E') {
      return (
        <Chip
          size="small"
          label="Grade E • Reappear"
          sx={{ bgcolor: '#fff6ea', color: '#df9e4c', fontWeight: 800, border: '1px solid #f8c076' }}
        />
      );
    }
    if (g === 'G') {
      return (
        <Chip
          size="small"
          label="Grade G • Improvement Required"
          sx={{ bgcolor: '#e5f3fb', color: '#0085db', fontWeight: 800, border: '1px solid #bce1f8' }}
        />
      );
    }
    if (g === 'D') {
      return (
        <Chip
          size="small"
          label="Grade D • Marginal Pass"
          sx={{ bgcolor: '#fff8e6', color: '#b7791f', fontWeight: 800, border: '1px solid #f6e05e' }}
        />
      );
    }
    if (g === 'C' || g === 'B') {
      return (
        <Chip
          size="small"
          label={`Grade ${g} • Passed`}
          sx={{ bgcolor: '#f0f5f9', color: '#475569', fontWeight: 700 }}
        />
      );
    }
    return (
      <Chip
        size="small"
        label={`Grade ${g}`}
        sx={{ bgcolor: '#dffff3', color: '#38b273', fontWeight: 800 }}
      />
    );
  };

  const handleFormSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        setSubmitted(false);
        const code = matchedCourse?.courseCode || (typeof selectedCourseInput === 'string' ? selectedCourseInput : 'Requested Course');
        onSubmitSuccess(code, supportType);
        setSelectedCourseInput(null);
        setInputValue('');
        setNotes('');
        onClose();
      }, 1600);
    }, 600);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: '16px', p: 1 },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              p: 1.2,
              borderRadius: '12px',
              bgcolor: '#e5f3fb',
              color: '#0085db',
              display: 'flex',
            }}
          >
            <IconSparkles size={26} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#111c2d' }}>
              Request Tuition for Any Previous Subject
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Search any course from previous terms. Your historical grade & marks will be auto-loaded.
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        {submitted ? (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Box
              sx={{
                bgcolor: '#dffff3',
                color: '#38b273',
                width: 64,
                height: 64,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <IconCircleCheck size={40} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#111c2d', mb: 1 }}>
              Tuition Request Submitted!
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 460, mx: 'auto' }}>
              Your tuition request for <strong>{matchedCourse?.courseCode || inputValue}</strong> has been logged. The academic support cell will assign faculty / study materials.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Step 1: Course Search & Autocomplete */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#111c2d', mb: 1 }}>
              Enter Subject Name or Course Code:
            </Typography>

            <Autocomplete
              freeSolo
              options={student.academicHistory}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                return `${option.courseCode} - ${option.courseTitle} (Grade: ${option.grade}, Sem ${option.semester})`;
              }}
              value={selectedCourseInput}
              onChange={(event, newValue) => {
                setSelectedCourseInput(newValue);
              }}
              inputValue={inputValue}
              onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="e.g., CSE316, INT219, MTH101, Data Structures..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                    },
                  }}
                />
              )}
              sx={{ mb: 2.5 }}
            />

            {/* Step 2: Auto-Detected Grade & Historical Academic Record Card */}
            {matchedCourse ? (
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '14px',
                  bgcolor: '#f8fafc',
                  border: '1.5px solid #0085db',
                  boxShadow: '0 4px 16px rgba(0, 133, 219, 0.08)',
                  mb: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0085db' }}>
                        {matchedCourse.courseCode}
                      </Typography>
                      <Chip
                        size="small"
                        label={`Semester ${matchedCourse.semester}`}
                        sx={{ bgcolor: '#e5f3fb', color: '#0085db', fontWeight: 700, fontSize: '0.72rem' }}
                      />
                      <Chip
                        size="small"
                        label={matchedCourse.courseType}
                        sx={{ bgcolor: '#f1f5f9', fontWeight: 600, fontSize: '0.72rem' }}
                      />
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: '#111c2d', mt: 0.5 }}>
                      {matchedCourse.courseTitle}
                    </Typography>
                  </Box>

                  {/* Auto-detected grade chip */}
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>
                      Auto-Detected Previous Grade:
                    </Typography>
                    {getGradeChip(matchedCourse.grade)}
                  </Box>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Term Taken:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#111c2d' }}>
                      {matchedCourse.termTaken}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Previous Score:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: matchedCourse.grade === 'F' || matchedCourse.grade === 'E' ? '#e07154' : '#111c2d' }}>
                      {matchedCourse.totalMarks} / {matchedCourse.maxMarks} Marks
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Course Credits:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#111c2d' }}>
                      {matchedCourse.credits} Credits
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Previous Faculty:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#111c2d' }}>
                      {matchedCourse.faculty}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            ) : inputValue.trim() ? (
              <Box
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: '#fffbf0',
                  border: '1px solid #f6e05e',
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <IconAlertCircle size={24} style={{ color: '#b7791f' }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#744210' }}>
                    Custom Subject: "{inputValue}"
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#975a16' }}>
                    This subject code was not found in your previous transcript. You can still submit a custom tuition request.
                  </Typography>
                </Box>
              </Box>
            ) : null}

            {/* Step 3: Choose Support Type (Online Classes vs Study Material) */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#111c2d', mb: 1.25 }}>
              Choose Tuition Delivery Mode:
            </Typography>

            <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  onClick={() => setSupportType('online_classes')}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    border: '2px solid',
                    borderColor: supportType === 'online_classes' ? '#0085db' : '#e2e8f0',
                    bgcolor: supportType === 'online_classes' ? '#f0f8ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    '&:hover': { borderColor: supportType === 'online_classes' ? '#0085db' : '#cbd5e1' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          bgcolor: supportType === 'online_classes' ? '#0085db' : '#f1f5f9',
                          color: supportType === 'online_classes' ? '#ffffff' : '#64748b',
                          p: 0.75,
                          borderRadius: '8px',
                          display: 'flex',
                        }}
                      >
                        <IconVideo size={18} />
                      </Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 800, color: supportType === 'online_classes' ? '#0085db' : '#111c2d' }}
                      >
                        Online Live Extra Classes
                      </Typography>
                    </Box>
                    <Radio
                      checked={supportType === 'online_classes'}
                      onChange={() => setSupportType('online_classes')}
                      value="online_classes"
                      size="small"
                      sx={{ p: 0, color: '#0085db' }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Live interactive virtual lecture batches & weekly doubt resolution with faculty.
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  onClick={() => setSupportType('study_material')}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    border: '2px solid',
                    borderColor: supportType === 'study_material' ? '#0085db' : '#e2e8f0',
                    bgcolor: supportType === 'study_material' ? '#f0f8ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    '&:hover': { borderColor: supportType === 'study_material' ? '#0085db' : '#cbd5e1' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          bgcolor: supportType === 'study_material' ? '#0085db' : '#f1f5f9',
                          color: supportType === 'study_material' ? '#ffffff' : '#64748b',
                          p: 0.75,
                          borderRadius: '8px',
                          display: 'flex',
                        }}
                      >
                        <IconBooks size={18} />
                      </Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 800, color: supportType === 'study_material' ? '#0085db' : '#111c2d' }}
                      >
                        Study Material & PYQ Solved
                      </Typography>
                    </Box>
                    <Radio
                      checked={supportType === 'study_material'}
                      onChange={() => setSupportType('study_material')}
                      value="study_material"
                      size="small"
                      sx={{ p: 0, color: '#0085db' }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Full syllabus digital notes, recorded video capsules, formula summaries & question banks.
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Step 4: Specific Doubts / Request Notes */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#111c2d', mb: 1 }}>
              Specify Specific Topics or Objectives:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2.5}
              placeholder="e.g., Want to prepare for upcoming reappear exam and improve understanding of Unit 2 & 4..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                },
              }}
            />
          </>
        )}
      </DialogContent>

      {!submitted && (
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} variant="outlined" sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            onClick={handleFormSubmit}
            variant="contained"
            disabled={loading || (!matchedCourse && !inputValue.trim())}
            startIcon={<IconSend size={16} />}
            sx={{
              fontWeight: 700,
              bgcolor: '#0085db',
              '&:hover': { bgcolor: '#006cb3' },
            }}
          >
            {loading ? 'Submitting...' : 'Submit Tuition Request'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
