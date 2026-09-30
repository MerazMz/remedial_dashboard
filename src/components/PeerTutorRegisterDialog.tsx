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
  RadioGroup,
  Radio,
  TextField,
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import {
  IconSchool,
  IconAward,
  IconVideo,
  IconBuilding,
  IconCircleCheck,
  IconUserCheck,
} from '@tabler/icons-react';
import confetti from 'canvas-confetti';
import { PeerTutorCourse } from '../mock/remedialMockData';

interface PeerTutorRegisterDialogProps {
  open: boolean;
  onClose: () => void;
  course: PeerTutorCourse | null;
  onConfirmSuccess: (courseId: string) => void;
}

export default function PeerTutorRegisterDialog({
  open,
  onClose,
  course,
  onConfirmSuccess,
}: PeerTutorRegisterDialogProps) {
  const [teachingMode, setTeachingMode] = useState<'online' | 'offline' | 'hybrid'>('online');
  const [slot, setSlot] = useState<string>('evening');
  const [batchSize, setBatchSize] = useState<string>('small_group');
  const [statement, setStatement] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!course) return null;

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        setSubmitted(false);
        onConfirmSuccess(course.id);
        onClose();
      }, 1500);
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
            <IconSchool size={26} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#111c2d' }}>
              Apply as Peer Tutor / Student Teacher
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {course.courseCode} • {course.courseTitle}
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
              Peer Tutor Application Registered!
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 460, mx: 'auto' }}>
              Your application to teach <strong>{course.courseCode}</strong> as a peer tutor has been confirmed. The academic coordinator will allocate junior students to your batch.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Verified Grade Highlight Banner */}
            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                bgcolor: '#f8fafc',
                border: '1.5px solid #0085db',
                mb: 2.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                  Verified Academic Mastery:
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#111c2d' }}>
                  {course.gradeDescription} ({course.marksObtained}/{course.maxMarks} Marks)
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Completed in {course.termTaken} • {course.credits} Credits
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'right' }}>
                <Chip
                  icon={<IconAward size={16} />}
                  label={`Grade ${course.grade} Verified`}
                  sx={{ bgcolor: '#e5f3fb', color: '#0085db', fontWeight: 800, fontSize: '0.8rem', mb: 0.5 }}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>
                  Honorarium: ₹{course.hourlyHonorarium} / hr
                </Typography>
              </Box>
            </Box>

            {/* Teaching Mode Preference */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#111c2d', mb: 1 }}>
              Select Preferred Teaching Delivery Mode:
            </Typography>
            <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box
                  onClick={() => setTeachingMode('online')}
                  sx={{
                    p: 1.75,
                    borderRadius: '10px',
                    border: '1.5px solid',
                    borderColor: teachingMode === 'online' ? '#0085db' : '#e2e8f0',
                    bgcolor: teachingMode === 'online' ? '#f0f8ff' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Radio checked={teachingMode === 'online'} value="online" size="small" sx={{ p: 0.5, color: '#0085db' }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Online (Google Meet)
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Virtual interactive classes
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Box
                  onClick={() => setTeachingMode('offline')}
                  sx={{
                    p: 1.75,
                    borderRadius: '10px',
                    border: '1.5px solid',
                    borderColor: teachingMode === 'offline' ? '#0085db' : '#e2e8f0',
                    bgcolor: teachingMode === 'offline' ? '#f0f8ff' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Radio checked={teachingMode === 'offline'} value="offline" size="small" sx={{ p: 0.5, color: '#0085db' }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Offline (Campus Lab)
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Block Lab / Classroom
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Box
                  onClick={() => setTeachingMode('hybrid')}
                  sx={{
                    p: 1.75,
                    borderRadius: '10px',
                    border: '1.5px solid',
                    borderColor: teachingMode === 'hybrid' ? '#0085db' : '#e2e8f0',
                    bgcolor: teachingMode === 'hybrid' ? '#f0f8ff' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Radio checked={teachingMode === 'hybrid'} value="hybrid" size="small" sx={{ p: 0.5, color: '#0085db' }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Hybrid Flexibility
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Mix of online & campus
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Availability Slots */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#111c2d', mb: 1 }}>
              Select Weekly Availability Slot:
            </Typography>
            <RadioGroup
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              sx={{ gap: 1, mb: 2.5 }}
            >
              <Box
                onClick={() => setSlot('evening')}
                sx={{
                  p: 1.25,
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: slot === 'evening' ? '#0085db' : '#e2e8f0',
                  bgcolor: slot === 'evening' ? '#f0f8ff' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Radio value="evening" size="small" sx={{ p: 0.5, color: '#0085db' }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Weekday Evenings (Tue & Thu • 05:00 PM - 06:30 PM)
                </Typography>
              </Box>

              <Box
                onClick={() => setSlot('weekend')}
                sx={{
                  p: 1.25,
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: slot === 'weekend' ? '#0085db' : '#e2e8f0',
                  bgcolor: slot === 'weekend' ? '#f0f8ff' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Radio value="weekend" size="small" sx={{ p: 0.5, color: '#0085db' }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Weekend Intensive (Saturday • 10:00 AM - 01:00 PM)
                </Typography>
              </Box>
            </RadioGroup>

            {/* Statement / Notes */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#111c2d', mb: 1 }}>
              Teaching Experience or Key Topics You Specialize In:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2.5}
              placeholder="e.g., Excited to teach pointer concepts, memory management, and dynamic array algorithms to juniors..."
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
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
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={<IconUserCheck size={16} />}
            sx={{
              fontWeight: 700,
              bgcolor: '#0085db',
              '&:hover': { bgcolor: '#006cb3' },
            }}
          >
            {loading ? 'Submitting Application...' : 'Confirm Peer Tutor Enrollment'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
