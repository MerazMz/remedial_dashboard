'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import { IconX, IconPlus, IconBook2 } from '@tabler/icons-react';
import { SLMCourse } from '../../mock/slmMockData';

interface AddCourseDialogProps {
  open: boolean;
  onClose: () => void;
  onAddCourse: (newCourse: SLMCourse) => void;
  existingCourseCodes: string[];
}

export default function AddCourseDialog({
  open,
  onClose,
  onAddCourse,
  existingCourseCodes,
}: AddCourseDialogProps) {
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [department, setDepartment] = useState('School of Computer Science & Engineering');
  const [credits, setCredits] = useState<number>(4);
  const [term, setTerm] = useState('Spring Term 2026');
  const [facultyLead, setFacultyLead] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    const trimmedCode = courseCode.trim().toUpperCase();
    const trimmedTitle = courseTitle.trim();

    if (!trimmedCode) {
      setError('Course Code is required (e.g. CSE 306).');
      return;
    }

    if (!trimmedTitle) {
      setError('Course Title is required.');
      return;
    }

    const codeExists = existingCourseCodes.some(
      (c) => c.replace(/\s+/g, '').toUpperCase() === trimmedCode.replace(/\s+/g, '')
    );

    if (codeExists) {
      setError(`Course with code "${trimmedCode}" already exists.`);
      return;
    }

    const newCourse: SLMCourse = {
      courseCode: trimmedCode,
      courseTitle: trimmedTitle,
      department,
      school: department,
      credits,
      term,
      facultyLead: facultyLead.trim() || 'Assigned Faculty Coordinator',
      totalStudentsEnrolled: 0,
      documents: [],
    };

    onAddCourse(newCourse);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setCourseCode('');
    setCourseTitle('');
    setDepartment('School of Computer Science & Engineering');
    setCredits(4);
    setTerm('Spring Term 2026');
    setFacultyLead('');
    setError(null);
  };

  const handleModalClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleModalClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '18px',
            p: 1,
          },
        },
      }}
    >
      <DialogTitle sx={{ px: 3, pt: 2.5, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: '#e5f3fb',
              color: '#0085db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconPlus size={20} stroke={2.5} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#111c2d', fontSize: '1.15rem' }}>
              Add New Course Code
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Create a new course repository for uploading Self Learning Material (SLM).
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={handleModalClose} sx={{ color: '#64748b' }}>
          <IconX size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '8px', py: 0.5, fontWeight: 600 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Course Code"
              placeholder="e.g. CSE 306"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              size="small"
              required
              autoFocus
              slotProps={{
                input: { sx: { borderRadius: '10px', bgcolor: '#f8fafc', fontWeight: 700 } },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="credits-select-label">Credits</InputLabel>
              <Select
                labelId="credits-select-label"
                value={credits}
                label="Credits"
                onChange={(e) => setCredits(Number(e.target.value))}
                sx={{ borderRadius: '10px', bgcolor: '#f8fafc' }}
              >
                <MenuItem value={1}>1 Credit</MenuItem>
                <MenuItem value={2}>2 Credits</MenuItem>
                <MenuItem value={3}>3 Credits</MenuItem>
                <MenuItem value={4}>4 Credits</MenuItem>
                <MenuItem value={5}>5 Credits</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Course Title / Subject Name"
              placeholder="e.g. Advanced Data Structures & Algorithmic Analysis"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              size="small"
              required
              slotProps={{
                input: { sx: { borderRadius: '10px', bgcolor: '#f8fafc' } },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="dept-select-label">Department / School</InputLabel>
              <Select
                labelId="dept-select-label"
                value={department}
                label="Department / School"
                onChange={(e) => setDepartment(e.target.value)}
                sx={{ borderRadius: '10px', bgcolor: '#f8fafc' }}
              >
                <MenuItem value="School of Computer Science & Engineering">School of CSE</MenuItem>
                <MenuItem value="School of Information Technology">School of IT</MenuItem>
                <MenuItem value="School of Electronics & Electrical Engineering">School of ECE</MenuItem>
                <MenuItem value="School of Mechanical Engineering">School of Mechanical</MenuItem>
                <MenuItem value="School of Design & Creative Arts">School of Design</MenuItem>
                <MenuItem value="Mittal School of Business">Mittal School of Business</MenuItem>
                <MenuItem value="School of Chemical & Physical Sciences">School of Sciences</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Academic Term"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              size="small"
              slotProps={{
                input: { sx: { borderRadius: '10px', bgcolor: '#f8fafc' } },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Faculty Coordinator / Lead (Optional)"
              placeholder="e.g. Dr. Debashis Roy (E14520)"
              value={facultyLead}
              onChange={(e) => setFacultyLead(e.target.value)}
              size="small"
              slotProps={{
                input: { sx: { borderRadius: '10px', bgcolor: '#f8fafc' } },
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'flex-end', gap: 1 }}>
        <Button
          variant="outlined"
          onClick={handleModalClose}
          sx={{
            borderRadius: '10px',
            borderColor: '#e2e8f0',
            color: '#64748b',
            '&:hover': { borderColor: '#cbd5e1' },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          startIcon={<IconPlus size={16} />}
          sx={{
            borderRadius: '10px',
            bgcolor: '#0085db',
            color: '#ffffff',
            fontWeight: 700,
            px: 2.5,
            '&:hover': { bgcolor: '#006cb3' },
          }}
        >
          Add Course
        </Button>
      </DialogActions>
    </Dialog>
  );
}
