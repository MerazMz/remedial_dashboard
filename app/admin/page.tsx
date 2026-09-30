'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  Typography,
  Button,
} from '@mui/material';
import { IconUpload, IconSparkles } from '@tabler/icons-react';
import Breadcrumb from '../../src/components/Breadcrumb';
import CourseAccordionSidebar from '../../src/components/slm/CourseAccordionSidebar';
import MaterialUploadPanel from '../../src/components/slm/MaterialUploadPanel';
import GenerateTestPanel from '../../src/components/slm/GenerateTestPanel';
import AddCourseDialog from '../../src/components/slm/AddCourseDialog';
import { SLMCourse, SLMDocument } from '../../src/mock/slmMockData';

export default function AdminDashboardPage() {
  const [courses, setCourses] = useState<SLMCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<SLMCourse | null>(null);
  const [activeTab, setActiveTab] = useState<'upload-slm' | 'generate-test'>('upload-slm');
  const [isLoading, setIsLoading] = useState(true);
  const [addCourseDialogOpen, setAddCourseDialogOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'info' | 'error'>('success');

  // Load persisted courses from root file storage
  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/slm');
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setCourses(result.data);
        setSelectedCourse((prev) => {
          if (prev) {
            const matched = result.data.find(
              (c: SLMCourse) => c.courseCode.toLowerCase() === prev.courseCode.toLowerCase()
            );
            return matched || null;
          }
          return null;
        });
      }
    } catch (error) {
      console.error('Failed to load SLM courses from server:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage('Could not load saved SLM courses from file storage.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Handle course selection
  const handleSelectCourse = (course: SLMCourse) => {
    setSelectedCourse(course);
  };

  // Handle adding new course code
  const handleAddCourse = async (newCourse: SLMCourse) => {
    try {
      // Optimistic update
      setCourses((prev) => [newCourse, ...prev]);
      setSelectedCourse(newCourse);

      // Persist to root file storage via API
      const res = await fetch('/api/slm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_course',
          course: newCourse,
        }),
      });

      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setCourses(result.data);
        const updated = result.data.find(
          (c: SLMCourse) => c.courseCode.toLowerCase() === newCourse.courseCode.toLowerCase()
        );
        if (updated) setSelectedCourse(updated);
      }

      setSnackbarSeverity('success');
      setSnackbarMessage(`Course code "${newCourse.courseCode}" added & saved permanently!`);
    } catch (error) {
      console.error('Error saving course to disk:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage('Failed to persist course to file storage.');
    }
  };

  // Handle uploading new document to a course
  const handleUploadDocument = async (
    courseCode: string,
    newDocData: Omit<SLMDocument, 'id' | 'uploadedAt' | 'downloadsCount'>
  ) => {
    const newDoc: SLMDocument = {
      ...newDocData,
      id: `doc-${Date.now()}`,
      uploadedAt: 'Today',
      downloadsCount: 0,
    };

    // Optimistic UI update
    const updatedCourses = courses.map((c) => {
      if (c.courseCode.toLowerCase() === courseCode.toLowerCase()) {
        return {
          ...c,
          documents: [newDoc, ...c.documents],
        };
      }
      return c;
    });

    setCourses(updatedCourses);
    const active = updatedCourses.find(
      (c) => c.courseCode.toLowerCase() === courseCode.toLowerCase()
    );
    if (active) setSelectedCourse(active);

    try {
      // Persist to file
      const res = await fetch('/api/slm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload_document',
          courseCode,
          document: newDoc,
        }),
      });

      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setCourses(result.data);
        const synced = result.data.find(
          (c: SLMCourse) => c.courseCode.toLowerCase() === courseCode.toLowerCase()
        );
        if (synced) setSelectedCourse(synced);
      }

      setSnackbarSeverity('success');
      setSnackbarMessage(`Successfully uploaded "${newDoc.name}" for ${courseCode} (saved to disk)!`);
    } catch (error) {
      console.error('Error persisting document upload to disk:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage('Failed to save document to file storage.');
    }
  };

  // Handle deleting document
  const handleDeleteDocument = async (courseCode: string, docId: string) => {
    // Optimistic update
    const updatedCourses = courses.map((c) => {
      if (c.courseCode.toLowerCase() === courseCode.toLowerCase()) {
        return {
          ...c,
          documents: c.documents.filter((d) => d.id !== docId),
        };
      }
      return c;
    });

    setCourses(updatedCourses);
    const active = updatedCourses.find(
      (c) => c.courseCode.toLowerCase() === courseCode.toLowerCase()
    );
    if (active) setSelectedCourse(active);

    try {
      const res = await fetch('/api/slm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_document',
          courseCode,
          documentId: docId,
        }),
      });

      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setCourses(result.data);
        const synced = result.data.find(
          (c: SLMCourse) => c.courseCode.toLowerCase() === courseCode.toLowerCase()
        );
        if (synced) setSelectedCourse(synced);
      }

      setSnackbarSeverity('info');
      setSnackbarMessage('Document removed from course repository and updated on disk.');
    } catch (error) {
      console.error('Error deleting document from disk:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage('Failed to update file storage after document deletion.');
    }
  };

  return (
    <Box>
      {/* 1. Breadcrumb Header */}
      <Breadcrumb
        title="Admin Academic Material & Assessment Portal"
        subtitle="Manage course codes, upload self learning material (SLM), and generate AI test papers."
        items={[
          { title: 'Admin Services' },
          { title: 'Upload SLM & Generate Test' },
        ]}
      />

      {/* 2. Main Two-Column Layout: Left Sidebar + Right Material/Test Panel */}
      {isLoading ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            gap: 2,
          }}
        >
          <CircularProgress size={42} sx={{ color: '#0085db' }} />
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
            Loading course repository...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
          {/* Left Column: Course Code Accordion Sidebar */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <CourseAccordionSidebar
              courses={courses}
              selectedCourse={selectedCourse}
              onSelectCourse={handleSelectCourse}
              onAddCourse={handleAddCourse}
            />
          </Grid>

          {/* Right Column: Top Mode Switcher + Active Panel */}
          <Grid size={{ xs: 12, lg: 8 }}>
            {/* Top Mode Switcher Tabs */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                bgcolor: '#ffffff',
                p: 0.75,
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                mb: 3,
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
                gap: 1,
              }}
            >
              <Button
                variant={activeTab === 'upload-slm' ? 'contained' : 'text'}
                onClick={() => setActiveTab('upload-slm')}
                startIcon={<IconUpload size={18} />}
                sx={{
                  flex: { xs: 1, sm: 'initial' },
                  px: 2.5,
                  py: 1,
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  textTransform: 'none',
                  bgcolor: activeTab === 'upload-slm' ? '#0085db' : 'transparent',
                  color: activeTab === 'upload-slm' ? '#ffffff' : '#64748b',
                  boxShadow: activeTab === 'upload-slm' ? '0 3px 10px rgba(0, 133, 219, 0.25)' : 'none',
                  '&:hover': {
                    bgcolor: activeTab === 'upload-slm' ? '#006cb3' : '#f1f5f9',
                    color: activeTab === 'upload-slm' ? '#ffffff' : '#0085db',
                  },
                }}
              >
                Upload SLM (Material Hub)
              </Button>

              <Button
                variant={activeTab === 'generate-test' ? 'contained' : 'text'}
                onClick={() => setActiveTab('generate-test')}
                startIcon={<IconSparkles size={18} />}
                sx={{
                  flex: { xs: 1, sm: 'initial' },
                  px: 2.5,
                  py: 1,
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  textTransform: 'none',
                  bgcolor: activeTab === 'generate-test' ? '#0085db' : 'transparent',
                  color: activeTab === 'generate-test' ? '#ffffff' : '#64748b',
                  boxShadow: activeTab === 'generate-test' ? '0 3px 10px rgba(0, 133, 219, 0.25)' : 'none',
                  '&:hover': {
                    bgcolor: activeTab === 'generate-test' ? '#006cb3' : '#f1f5f9',
                    color: activeTab === 'generate-test' ? '#ffffff' : '#0085db',
                  },
                }}
              >
                Generate Test (AI Engine)
              </Button>
            </Box>

            {/* Render Active Mode Panel */}
            {activeTab === 'upload-slm' ? (
              <MaterialUploadPanel
                selectedCourse={selectedCourse}
                onUploadDocument={handleUploadDocument}
                onDeleteDocument={handleDeleteDocument}
                onOpenAddCourse={() => setAddCourseDialogOpen(true)}
              />
            ) : (
              <GenerateTestPanel
                selectedCourse={selectedCourse}
                onOpenAddCourse={() => setAddCourseDialogOpen(true)}
              />
            )}
          </Grid>
        </Grid>
      )}

      {/* Add Course Dialog */}
      <AddCourseDialog
        open={addCourseDialogOpen}
        onClose={() => setAddCourseDialogOpen(false)}
        onAddCourse={handleAddCourse}
        existingCourseCodes={courses.map((c) => c.courseCode)}
      />

      {/* 3. Notification Snackbar */}
      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={4000}
        onClose={() => setSnackbarMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarMessage(null)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%', borderRadius: '10px', fontWeight: 600 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
