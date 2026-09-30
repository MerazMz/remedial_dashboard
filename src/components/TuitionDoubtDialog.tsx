'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  RadioGroup,
  Radio,
  Chip,
  Grid,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  IconVideo,
  IconBooks,
  IconCircleCheck,
  IconDownload,
  IconCalendarEvent,
  IconFileText,
  IconDeviceLaptop,
} from '@tabler/icons-react';
import confetti from 'canvas-confetti';
import { TuitionCourse } from '../mock/remedialMockData';

interface TuitionDoubtDialogProps {
  open: boolean;
  onClose: () => void;
  course: TuitionCourse | null;
}

export type TuitionOptionType = 'online_classes' | 'study_material';

export default function TuitionDoubtDialog({
  open,
  onClose,
  course,
}: TuitionDoubtDialogProps) {
  // Option selection: Online Classes vs Study Material
  const [tuitionOption, setTuitionOption] = useState<TuitionOptionType>('online_classes');

  // Sub-options for Online Classes
  const [selectedLiveSlot, setSelectedLiveSlot] = useState('slot1');
  const [topicNotes, setTopicNotes] = useState('');

  // Sub-options for Study Material
  const [selectedMaterialType, setSelectedMaterialType] = useState<string>('all_units');
  const [includeQuestionBank, setIncludeQuestionBank] = useState<boolean>(true);
  const [includeVideoRecordings, setIncludeVideoRecordings] = useState<boolean>(true);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!course) return null;

  const handleSubmit = () => {
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
        setTopicNotes('');
        onClose();
      }, 1600);
    }, 500);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
              p: 1,
              borderRadius: '10px',
              bgcolor: '#e5f3fb',
              color: '#0085db',
              display: 'flex',
            }}
          >
            <IconDeviceLaptop size={24} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#111c2d' }}>
              Tuition Class Support & Resources
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {course.courseCode} • {course.courseTitle}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        {submitted ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Box
              sx={{
                bgcolor: '#dffff3',
                color: '#38b273',
                width: 60,
                height: 60,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <IconCircleCheck size={36} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#111c2d', mb: 1 }}>
              {tuitionOption === 'online_classes' ? 'Online Class Enrolled!' : 'Study Materials Sent!'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 400, mx: 'auto' }}>
              {tuitionOption === 'online_classes'
                ? `You are registered for the online live class. Meeting link and calendar invite sent for ${course.instructor}.`
                : `Comprehensive course modules and question banks for ${course.courseCode} have been unlocked in your learning portal.`}
            </Typography>
          </Box>
        ) : (
          <>
            {/* Faculty banner */}
            <Box
              sx={{
                p: 1.75,
                borderRadius: '12px',
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                mb: 2.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                  Course Instructor:
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#111c2d' }}>
                  {course.instructor}
                </Typography>
              </Box>
              <Chip
                size="small"
                label={`Attendance: ${course.attendancePercentage}%`}
                sx={{
                  bgcolor: course.attendancePercentage < 75 ? '#ffede9' : '#dffff3',
                  color: course.attendancePercentage < 75 ? '#e07154' : '#38b273',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                }}
              />
            </Box>

            {/* 2 Option Radio Selection: Online Classes vs Study Material */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#111c2d', mb: 1.25 }}>
              Choose Support Type:
            </Typography>

            <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
              {/* Option 1: Online Classes */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  onClick={() => setTuitionOption('online_classes')}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    border: '2px solid',
                    borderColor: tuitionOption === 'online_classes' ? '#0085db' : '#e2e8f0',
                    bgcolor: tuitionOption === 'online_classes' ? '#f0f8ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    '&:hover': {
                      borderColor: tuitionOption === 'online_classes' ? '#0085db' : '#cbd5e1',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          bgcolor: tuitionOption === 'online_classes' ? '#0085db' : '#f1f5f9',
                          color: tuitionOption === 'online_classes' ? '#ffffff' : '#64748b',
                          p: 0.75,
                          borderRadius: '8px',
                          display: 'flex',
                        }}
                      >
                        <IconVideo size={18} />
                      </Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 800,
                          color: tuitionOption === 'online_classes' ? '#0085db' : '#111c2d',
                        }}
                      >
                        Online Classes
                      </Typography>
                    </Box>
                    <Radio
                      checked={tuitionOption === 'online_classes'}
                      onChange={() => setTuitionOption('online_classes')}
                      value="online_classes"
                      name="tuition-support-radio"
                      size="small"
                      sx={{ p: 0, color: '#0085db' }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.3 }}>
                    Live interactive virtual lectures & 1-on-1 doubt clearing sessions with faculty.
                  </Typography>
                </Box>
              </Grid>

              {/* Option 2: Study Material */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  onClick={() => setTuitionOption('study_material')}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    border: '2px solid',
                    borderColor: tuitionOption === 'study_material' ? '#0085db' : '#e2e8f0',
                    bgcolor: tuitionOption === 'study_material' ? '#f0f8ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    '&:hover': {
                      borderColor: tuitionOption === 'study_material' ? '#0085db' : '#cbd5e1',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          bgcolor: tuitionOption === 'study_material' ? '#0085db' : '#f1f5f9',
                          color: tuitionOption === 'study_material' ? '#ffffff' : '#64748b',
                          p: 0.75,
                          borderRadius: '8px',
                          display: 'flex',
                        }}
                      >
                        <IconBooks size={18} />
                      </Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 800,
                          color: tuitionOption === 'study_material' ? '#0085db' : '#111c2d',
                        }}
                      >
                        Study Material
                      </Typography>
                    </Box>
                    <Radio
                      checked={tuitionOption === 'study_material'}
                      onChange={() => setTuitionOption('study_material')}
                      value="study_material"
                      name="tuition-support-radio"
                      size="small"
                      sx={{ p: 0, color: '#0085db' }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.3 }}>
                    Download curated notes, question banks, solved formulas, and module archives.
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* DYNAMIC SUB-OPTIONS BASED ON SELECTED OPTION */}
            {tuitionOption === 'online_classes' ? (
              /* ONLINE CLASSES DETAILS */
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#111c2d', mb: 1 }}>
                  Select Live Online Class Slot:
                </Typography>
                <RadioGroup
                  value={selectedLiveSlot}
                  onChange={(e) => setSelectedLiveSlot(e.target.value)}
                  sx={{ gap: 1, mb: 2 }}
                >
                  <Box
                    onClick={() => setSelectedLiveSlot('slot1')}
                    sx={{
                      p: 1.25,
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: selectedLiveSlot === 'slot1' ? '#0085db' : '#e2e8f0',
                      bgcolor: selectedLiveSlot === 'slot1' ? '#f0f8ff' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Radio value="slot1" size="small" sx={{ p: 0.5, color: '#0085db' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Wednesday • 04:00 PM - 05:00 PM (Live Google Meet)
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Topic Focus: Mid-term syllabus review & problem solving
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    onClick={() => setSelectedLiveSlot('slot2')}
                    sx={{
                      p: 1.25,
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: selectedLiveSlot === 'slot2' ? '#0085db' : '#e2e8f0',
                      bgcolor: selectedLiveSlot === 'slot2' ? '#f0f8ff' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Radio value="slot2" size="small" sx={{ p: 0.5, color: '#0085db' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Friday • 05:30 PM - 06:30 PM (Interactive Virtual Lab)
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Topic Focus: Practical programming & assignment help
                      </Typography>
                    </Box>
                  </Box>
                </RadioGroup>

                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#111c2d', mb: 1 }}>
                  Specify Doubts or Topics to Cover:
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2.5}
                  placeholder="e.g., Requesting deep dive into Unit 3 algorithms and sample numerical problems..."
                  value={topicNotes}
                  onChange={(e) => setTopicNotes(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                    },
                  }}
                />
              </Box>
            ) : (
              /* STUDY MATERIAL DETAILS */
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#111c2d', mb: 1 }}>
                  Select Study Material Package:
                </Typography>
                <RadioGroup
                  value={selectedMaterialType}
                  onChange={(e) => setSelectedMaterialType(e.target.value)}
                  sx={{ gap: 1, mb: 2 }}
                >
                  <Box
                    onClick={() => setSelectedMaterialType('all_units')}
                    sx={{
                      p: 1.25,
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: selectedMaterialType === 'all_units' ? '#0085db' : '#e2e8f0',
                      bgcolor: selectedMaterialType === 'all_units' ? '#f0f8ff' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Radio value="all_units" size="small" sx={{ p: 0.5, color: '#0085db' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Complete Syllabus Lecture Notes (PDF - Units 1 to 6)
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Curated notes by {course.instructor} with highlighted exam concepts
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    onClick={() => setSelectedMaterialType('exam_pack')}
                    sx={{
                      p: 1.25,
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: selectedMaterialType === 'exam_pack' ? '#0085db' : '#e2e8f0',
                      bgcolor: selectedMaterialType === 'exam_pack' ? '#f0f8ff' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Radio value="exam_pack" size="small" sx={{ p: 0.5, color: '#0085db' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Quick Revision Formula Sheet & High-Yield Summary
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Concise chapter summaries for rapid midterm & endterm prep
                      </Typography>
                    </Box>
                  </Box>
                </RadioGroup>

                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#111c2d', mb: 0.5 }}>
                  Included Study Resources:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, bgcolor: '#f8fafc', p: 1.5, borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeQuestionBank}
                        onChange={(e) => setIncludeQuestionBank(e.target.checked)}
                        size="small"
                        sx={{ color: '#0085db' }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#111c2d' }}>
                        Previous 5-Year Solved Question Papers & Model Answers
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeVideoRecordings}
                        onChange={(e) => setIncludeVideoRecordings(e.target.checked)}
                        size="small"
                        sx={{ color: '#0085db' }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#111c2d' }}>
                        Recorded Video Lectures & Code Repository Access
                      </Typography>
                    }
                  />
                </Box>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      {!submitted && (
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} variant="outlined" sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || (tuitionOption === 'online_classes' && !topicNotes.trim())}
            sx={{
              fontWeight: 700,
              bgcolor: '#0085db',
              '&:hover': { bgcolor: '#006cb3' },
            }}
          >
            {loading
              ? 'Processing...'
              : tuitionOption === 'online_classes'
              ? 'Register for Online Class'
              : 'Request & Download Material'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
