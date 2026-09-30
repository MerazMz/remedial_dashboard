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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  IconChecklist,
  IconShieldCheck,
} from '@tabler/icons-react';
import confetti from 'canvas-confetti';
import { RemedialCourse } from '../mock/remedialMockData';

interface RemedialRegisterDialogProps {
  open: boolean;
  onClose: () => void;
  course: RemedialCourse | null;
  onConfirmSuccess: (courseId: string) => void;
}

export default function RemedialRegisterDialog({
  open,
  onClose,
  course,
  onConfirmSuccess,
}: RemedialRegisterDialogProps) {
  const [selectedSlot, setSelectedSlot] = useState<string>('evening');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  if (!course) return null;

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        setSuccess(false);
        onConfirmSuccess(course.id);
        onClose();
      }, 1400);
    }, 600);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '16px',
            p: 1,
          },
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
            <IconChecklist size={24} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#111c2d' }}>
              Remedial Class Registration
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {course.courseCode} • {course.courseTitle}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        {success ? (
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
              <IconShieldCheck size={36} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#111c2d', mb: 1 }}>
              Registration Confirmed!
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              You are successfully registered for the remedial class batch. Timetable has been synced.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Backlog Summary Box */}
            <Box
              sx={{
                p: 2,
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
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Backlog Grade Status:
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#e07154' }}>
                  Grade {course.grade} ({course.gradeDescription})
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Remedial Course Fee:
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0085db' }}>
                  ₹{course.remedialFee}
                </Typography>
              </Box>
            </Box>

            {/* Select Preferred Batch Schedule */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#111c2d', mb: 1 }}>
              Select Remedial Batch Slot:
            </Typography>
            <RadioGroup
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              sx={{ gap: 1.25, mb: 2.5 }}
            >
              <Box
                onClick={() => setSelectedSlot('evening')}
                sx={{
                  p: 1.5,
                  borderRadius: '10px',
                  border: '1.5px solid',
                  borderColor: selectedSlot === 'evening' ? '#0085db' : '#e2e8f0',
                  bgcolor: selectedSlot === 'evening' ? '#f0f8ff' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Radio value="evening" size="small" sx={{ p: 0.5, color: '#0085db' }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#111c2d' }}>
                    Regular Evening Batch (Mon, Wed, Fri • 05:00 PM - 06:30 PM)
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Faculty: {course.assignedFaculty} • Room: {course.remedialRoom}
                  </Typography>
                </Box>
              </Box>

              <Box
                onClick={() => setSelectedSlot('weekend')}
                sx={{
                  p: 1.5,
                  borderRadius: '10px',
                  border: '1.5px solid',
                  borderColor: selectedSlot === 'weekend' ? '#0085db' : '#e2e8f0',
                  bgcolor: selectedSlot === 'weekend' ? '#f0f8ff' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Radio value="weekend" size="small" sx={{ p: 0.5, color: '#0085db' }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#111c2d' }}>
                    Weekend Intensive Batch (Saturday & Sunday • 10:00 AM - 01:00 PM)
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Fast-track mode with practical lab sessions
                  </Typography>
                </Box>
              </Box>
            </RadioGroup>

            {/* Attendance Commitment Checklist */}
            <Box
              sx={{
                p: 1.5,
                bgcolor: '#fff6ea',
                borderRadius: '10px',
                border: '1px solid #f8c076',
                mb: 2,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#df9e4c', display: 'block', mb: 0.5 }}>
                ATTENDANCE MANDATE:
              </Typography>
              <Typography variant="caption" sx={{ color: '#593e1b', lineHeight: 1.4 }}>
                Students are required to maintain a minimum of <strong>75% attendance</strong> in the remedial batch to become eligible for the upcoming reappear exam.
              </Typography>
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  size="small"
                  sx={{ color: '#0085db' }}
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#111c2d' }}>
                  I confirm my enrollment and commit to the 75% attendance requirement.
                </Typography>
              }
            />
          </>
        )}
      </DialogContent>

      {!success && (
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} variant="outlined" sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={!agreeTerms || loading}
            sx={{
              fontWeight: 700,
              bgcolor: '#0085db',
              '&:hover': { bgcolor: '#006cb3' },
            }}
          >
            {loading ? 'Processing...' : `Confirm & Enroll (₹${course.remedialFee})`}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
