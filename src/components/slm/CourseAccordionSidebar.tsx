'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  InputBase,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  IconSearch,
  IconChevronDown,
  IconBook2,
  IconFiles,
  IconCheck,
  IconX,
  IconPlus,
} from '@tabler/icons-react';
import { SLMCourse } from '../../mock/slmMockData';
import AddCourseDialog from './AddCourseDialog';

interface CourseAccordionSidebarProps {
  courses: SLMCourse[];
  selectedCourse: SLMCourse | null;
  onSelectCourse: (course: SLMCourse) => void;
  onAddCourse: (newCourse: SLMCourse) => void;
}

export default function CourseAccordionSidebar({
  courses,
  selectedCourse,
  onSelectCourse,
  onAddCourse,
}: CourseAccordionSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCode, setExpandedCode] = useState<string | false>(
    selectedCourse ? selectedCourse.courseCode : false
  );
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Filter courses by code or title
  const filteredCourses = courses.filter(
    (c) =>
      c.courseCode.toLowerCase().replace(/\s+/g, '').includes(searchQuery.toLowerCase().replace(/\s+/g, '')) ||
      c.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAccordionChange = (courseCode: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedCode(isExpanded ? courseCode : false);
    if (isExpanded) {
      const found = courses.find((c) => c.courseCode === courseCode);
      if (found) {
        onSelectCourse(found);
      }
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        p: { xs: 2, sm: 2.5 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* 1. Header Title: "Select Available Course Code" */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: '#111c2d',
              fontSize: { xs: '1.05rem', sm: '1.15rem' },
              letterSpacing: '-0.2px',
              fontFamily: 'inherit',
            }}
          >
            Select Available Course Code
          </Typography>
          <Chip
            size="small"
            label={`${filteredCourses.length} Courses`}
            sx={{
              bgcolor: '#e5f3fb',
              color: '#0085db',
              fontWeight: 700,
              fontSize: '0.72rem',
              border: '1px solid #cbe6f7',
            }}
            />
        </Box>
        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
          Select a course from the list to view and upload Self Learning Material.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>

        {/* Search Input */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '12px',
            px: 1.5,
            height: '42px',
            transition: 'all 0.2s ease',
            '&:focus-within': {
              borderColor: '#0085db',
              bgcolor: '#ffffff',
              boxShadow: '0 0 0 3px rgba(0, 133, 219, 0.12)',
            },
          }}
        >
          <IconSearch size={18} color="#64748b" style={{ marginRight: '8px' }} />
          <InputBase
            placeholder="Search Course Code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              fontSize: '0.85rem',
              color: '#0f172a',
              width: '100%',
              fontWeight: 500,
            }}
            />
          {searchQuery && (
            <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ p: 0.2 }}>
              <IconX size={15} color="#94a3b8" />
            </IconButton>
          )}
        </Box>

          {/* 2. Plus Button Beside the Search Box Input Box (Left Side) */}
            <Tooltip title="Add New Course Code">
              <Button
                variant="contained"
                onClick={() => setAddDialogOpen(true)}
                sx={{
                  minWidth: '42px',
                  width: '42px',
                  height: '42px',
                  p: 0,
                  borderRadius: '12px',
                  bgcolor: '#0085db',
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0, 133, 219, 0.25)',
                  '&:hover': {
                    bgcolor: '#006cb3',
                  },
                }}
              >
                <IconPlus size={20} stroke={2.5} />
              </Button>
            </Tooltip>
      </Box>

      {/* 3. Accordion List of Course Codes */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          pr: 0.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.25,
          maxHeight: { xs: '380px', lg: 'calc(100vh - 280px)' },
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: '#cbd5e1',
            borderRadius: '4px',
          },
        }}
      >
        {courses.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center', color: '#94a3b8', px: 2 }}>
            <IconBook2 size={40} stroke={1.5} style={{ opacity: 0.5, marginBottom: 12 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155' }}>
              No course codes added yet
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5, mb: 2 }}>
              Click the &quot;+&quot; button above to create your first course.
            </Typography>
            <Button
              size="small"
              variant="contained"
              onClick={() => setAddDialogOpen(true)}
              startIcon={<IconPlus size={16} />}
              sx={{
                bgcolor: '#0085db',
                color: '#ffffff',
                textTransform: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.78rem',
                '&:hover': { bgcolor: '#006cb3' },
              }}
            >
              Add Course Code
            </Button>
          </Box>
        ) : filteredCourses.length === 0 ? (
          <Box sx={{ py: 5, textAlign: 'center', color: '#94a3b8' }}>
            <IconBook2 size={36} stroke={1.5} style={{ opacity: 0.6, marginBottom: 8 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              No course found matching &quot;{searchQuery}&quot;
            </Typography>
            <Button
              size="small"
              onClick={() => setSearchQuery('')}
              sx={{ mt: 1, textTransform: 'none', color: '#0085db' }}
            >
              Clear filter
            </Button>
          </Box>
        ) : (
          filteredCourses.map((course) => {
            const isSelected = selectedCourse?.courseCode === course.courseCode;
            const isExpanded = expandedCode === course.courseCode;

            return (
              <Accordion
                key={course.courseCode}
                expanded={isExpanded}
                onChange={handleAccordionChange(course.courseCode)}
                disableGutters
                elevation={0}
                sx={{
                  border: isSelected ? '2px solid #0085db' : '1.5px solid #e2e8f0',
                  borderRadius: '14px !important',
                  overflow: 'hidden',
                  bgcolor: isSelected ? '#f0f7fd' : '#ffffff',
                  transition: 'all 0.2s ease',
                  '&:before': { display: 'none' },
                  boxShadow: isSelected
                    ? '0 6px 16px rgba(0, 133, 219, 0.12)'
                    : '0 2px 6px rgba(0, 0, 0, 0.02)',
                  '&:hover': {
                    borderColor: isSelected ? '#0085db' : '#cbd5e1',
                    bgcolor: isSelected ? '#f0f7fd' : '#f8fafc',
                  },
                }}
              >
                {/* Accordion Summary */}
                <AccordionSummary
                  expandIcon={
                    <IconChevronDown
                      size={20}
                      style={{
                        color: isSelected ? '#0085db' : '#64748b',
                        transition: 'transform 0.2s',
                      }}
                    />
                  }
                  sx={{
                    px: 2,
                    py: 1,
                    minHeight: '56px',
                    '& .MuiAccordionSummary-content': {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      m: 0,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    {isSelected ? (
                      <Box
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          bgcolor: '#0085db',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconCheck size={16} stroke={3} />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: '8px',
                          bgcolor: '#f1f5f9',
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconBook2 size={16} />
                      </Box>
                    )}

                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 800,
                        fontSize: '1rem',
                        color: isSelected ? '#004d80' : '#1e293b',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {course.courseCode}
                    </Typography>
                  </Box>

                  <Chip
                    size="small"
                    icon={<IconFiles size={13} style={{ color: isSelected ? '#0085db' : '#64748b' }} />}
                    label={`${course.documents.length} SLM`}
                    sx={{
                      height: '24px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      bgcolor: isSelected ? '#e5f3fb' : '#f1f5f9',
                      color: isSelected ? '#0085db' : '#64748b',
                      border: isSelected ? '1px solid #cbe6f7' : '1px solid #e2e8f0',
                      mr: 1,
                    }}
                  />
                </AccordionSummary>

                {/* Accordion Details */}
                <AccordionDetails
                  sx={{
                    px: 2,
                    pt: 0,
                    pb: 2,
                    borderTop: '1px solid #f1f5f9',
                    bgcolor: isSelected ? '#ffffff' : '#fafafa',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: '#1e293b',
                      fontSize: '0.85rem',
                      mb: 0.5,
                      mt: 1,
                    }}
                  >
                    {course.courseTitle}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: '#64748b',
                      fontSize: '0.75rem',
                      mb: 1.5,
                    }}
                  >
                    {course.department} • {course.credits} Credits • {course.term}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                      Faculty Lead: {course.facultyLead.split('(')[0]}
                    </Typography>

                    {isSelected && (
                      <Chip
                        size="small"
                        label="Active Course"
                        sx={{
                          height: '22px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          bgcolor: '#e5f3fb',
                          color: '#0085db',
                          border: '1px solid #cbe6f7',
                        }}
                      />
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })
        )}
      </Box>

      {/* Add Course Dialog */}
      <AddCourseDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAddCourse={onAddCourse}
        existingCourseCodes={courses.map((c) => c.courseCode)}
      />
    </Card>
  );
}
