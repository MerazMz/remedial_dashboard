'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  TextField,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  IconUpload,
  IconFileText,
  IconFileTypePdf,
  IconFileTypePpt,
  IconFileTypeDocx,
  IconEye,
  IconTrash,
  IconDownload,
  IconPlus,
  IconSchool,
  IconFileCode,
  IconPresentation,
  IconFileCertificate,
  IconNotes,
  IconFolder,
  IconBook2,
} from '@tabler/icons-react';
import { SLMCourse, SLMDocument, SLMDocType, documentTypeLabels } from '../../mock/slmMockData';
import DocumentPreviewModal from './DocumentPreviewModal';

interface MaterialUploadPanelProps {
  selectedCourse: SLMCourse | null;
  onUploadDocument: (courseCode: string, newDoc: Omit<SLMDocument, 'id' | 'uploadedAt' | 'downloadsCount'>) => void;
  onDeleteDocument: (courseCode: string, docId: string) => void;
  onOpenAddCourse?: () => void;
}

export default function MaterialUploadPanel({
  selectedCourse,
  onUploadDocument,
  onDeleteDocument,
  onOpenAddCourse,
}: MaterialUploadPanelProps) {
  // Upload Form State
  const [selectedDocType, setSelectedDocType] = useState<SLMDocType>('syllabus');
  const [documentName, setDocumentName] = useState('');
  const [unitModule, setUnitModule] = useState('Full Course');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | SLMDocType>('all');
  const [tableSearch, setTableSearch] = useState('');

  // Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<SLMDocument | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const docTypesList: { type: SLMDocType; label: string; icon: React.ReactElement }[] = [
    { type: 'syllabus', label: 'Syllabus', icon: <IconSchool size={16} /> },
    { type: 'pyq', label: 'PYQ', icon: <IconFileCertificate size={16} /> },
    { type: 'ip', label: 'IP', icon: <IconFileCode size={16} /> },
    { type: 'notes', label: 'Notes', icon: <IconNotes size={16} /> },
    { type: 'ppt', label: 'PPT', icon: <IconPresentation size={16} /> },
    { type: 'other', label: 'Other', icon: <IconFolder size={16} /> },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      if (!documentName) {
        const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setDocumentName(rawName);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedFile(file);
      if (!documentName) {
        const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setDocumentName(rawName);
      }
    }
  };

  const handleUploadSubmit = () => {
    if (!selectedCourse) return;
    setFormError(null);

    if (!documentName.trim()) {
      setFormError('Please provide a name/title for the document.');
      return;
    }

    setUploading(true);

    setTimeout(() => {
      let format: 'pdf' | 'pptx' | 'docx' | 'zip' = 'pdf';
      let sizeStr = '2.4 MB';
      let fileName = `${selectedCourse.courseCode.replace(/\s+/g, '')}_${selectedDocType.toUpperCase()}.pdf`;

      if (uploadedFile) {
        fileName = uploadedFile.name;
        const sizeMb = (uploadedFile.size / (1024 * 1024)).toFixed(1);
        sizeStr = `${sizeMb} MB`;
        const ext = uploadedFile.name.split('.').pop()?.toLowerCase();
        if (ext === 'pptx' || ext === 'ppt') format = 'pptx';
        else if (ext === 'docx' || ext === 'doc') format = 'docx';
        else if (ext === 'zip' || ext === 'rar') format = 'zip';
        else format = 'pdf';
      }

      onUploadDocument(selectedCourse.courseCode, {
        courseCode: selectedCourse.courseCode,
        name: documentName.trim(),
        type: selectedDocType,
        fileName,
        fileSize: sizeStr,
        fileFormat: format,
        unitModule,
        uploadedBy: 'Faculty Coordinator',
      });

      setDocumentName('');
      setUploadedFile(null);
      setUploading(false);
    }, 400);
  };

  if (!selectedCourse) {
    return (
      <Card
        elevation={0}
        sx={{
          bgcolor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          p: { xs: 4, sm: 6 },
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: '#e5f3fb',
            color: '#0085db',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <IconBook2 size={32} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#111c2d', mb: 1 }}>
          No Course Code Selected
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 450, mx: 'auto', mb: 3 }}>
          Select an available course code from the left sidebar or click the &quot;+&quot; button to create a new course code.
        </Typography>
        {onOpenAddCourse && (
          <Button
            variant="contained"
            onClick={onOpenAddCourse}
            startIcon={<IconPlus size={18} />}
            sx={{
              bgcolor: '#0085db',
              color: '#ffffff',
              borderRadius: '10px',
              fontWeight: 700,
              px: 3,
              py: 1,
              '&:hover': { bgcolor: '#006cb3' },
            }}
          >
            Add New Course Code
          </Button>
        )}
      </Card>
    );
  }

  const displayedDocuments = (selectedCourse.documents || []).filter((doc) => {
    const matchesFilter = filterType === 'all' || doc.type === filterType;
    const matchesSearch =
      !tableSearch ||
      doc.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(tableSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getDocIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <IconFileTypePdf size={20} color="#dc2626" />;
      case 'pptx':
        return <IconFileTypePpt size={20} color="#ea580c" />;
      case 'docx':
        return <IconFileTypeDocx size={20} color="#2563eb" />;
      default:
        return <IconFileText size={20} color="#0085db" />;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 1. Clean Course Title Bar */}
      <Card
        elevation={0}
        sx={{
          bgcolor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          px: { xs: 2.5, sm: 3 },
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Chip
            label={selectedCourse.courseCode}
            sx={{
              bgcolor: '#0085db',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.9rem',
              height: '28px',
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#111c2d', fontSize: '1.05rem' }}>
            {selectedCourse.courseTitle}
          </Typography>
        </Box>

        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
          {selectedCourse.department} • {selectedCourse.documents.length} Materials
        </Typography>
      </Card>

      {/* 2. Upload Material Form */}
      <Card
        elevation={0}
        sx={{
          bgcolor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          p: { xs: 2.5, sm: 3 },
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#111c2d', mb: 2 }}>
          Upload New Material
        </Typography>

        {formError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '8px', py: 0.5, fontWeight: 600 }}>
            {formError}
          </Alert>
        )}

        {/* Document Type Selector (Clean Pill Chips) */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', mb: 1, display: 'block' }}>
            DOCUMENT TYPE
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {docTypesList.map((item) => {
              const isSelected = selectedDocType === item.type;
              const typeCfg = documentTypeLabels[item.type];

              return (
                <Chip
                  key={item.type}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => setSelectedDocType(item.type)}
                  sx={{
                    px: 1,
                    py: 1.8,
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    bgcolor: isSelected ? typeCfg.bgColor : '#f8fafc',
                    color: isSelected ? typeCfg.color : '#475569',
                    border: isSelected ? `1.5px solid ${typeCfg.color}` : '1px solid #e2e8f0',
                    transition: 'all 0.15s ease',
                    '& .MuiChip-icon': {
                      color: isSelected ? typeCfg.color : '#64748b',
                    },
                    '&:hover': {
                      bgcolor: isSelected ? typeCfg.bgColor : '#f1f5f9',
                      borderColor: typeCfg.color,
                    },
                  }}
                />
              );
            })}
          </Box>
        </Box>

        {/* Document Name & Unit Module Inputs */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              fullWidth
              size="small"
              label="Document Name"
              placeholder="e.g. Unit 1 Notes: Graph Algorithms & Red-Black Trees"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              slotProps={{
                input: { sx: { borderRadius: '10px', bgcolor: '#f8fafc' } },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="unit-label">Unit / Scope</InputLabel>
              <Select
                labelId="unit-label"
                value={unitModule}
                label="Unit / Scope"
                onChange={(e) => setUnitModule(e.target.value)}
                sx={{ borderRadius: '10px', bgcolor: '#f8fafc' }}
              >
                <MenuItem value="Full Course">Full Course</MenuItem>
                <MenuItem value="Unit 1">Unit 1</MenuItem>
                <MenuItem value="Unit 2">Unit 2</MenuItem>
                <MenuItem value="Unit 3">Unit 3</MenuItem>
                <MenuItem value="Unit 4">Unit 4</MenuItem>
                <MenuItem value="Unit 5">Unit 5</MenuItem>
                <MenuItem value="Unit 6">Unit 6</MenuItem>
                <MenuItem value="Mid-Term">Mid-Term</MenuItem>
                <MenuItem value="End-Term">End-Term</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Big Drag & Drop File Upload Zone */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.pptx,.ppt,.docx,.doc,.zip,.rar"
          style={{ display: 'none' }}
        />

        <Box
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            py: { xs: 3.5, sm: 4.5 },
            px: 3,
            mb: 2.5,
            borderRadius: '16px',
            border: isDragging ? '2px dashed #0085db' : '2px dashed #cbd5e1',
            bgcolor: isDragging ? '#e5f3fb' : '#fafafa',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: '#0085db',
              bgcolor: '#f5faff',
            },
          }}
        >
          {uploadedFile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              {getDocIcon(uploadedFile.name.split('.').pop() || 'pdf')}
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {uploadedFile.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for Upload
                </Typography>
              </Box>
              <Button
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadedFile(null);
                }}
                sx={{ ml: 2, textTransform: 'none', fontWeight: 700 }}
              >
                Remove
              </Button>
            </Box>
          ) : (
            <Box>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  bgcolor: '#f1f5f9',
                  color: '#0085db',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5,
                }}
              >
                <IconUpload size={28} />
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                Click to browse or drag and drop file
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontSize: '0.8rem' }}>
                Supported formats: <strong>PDF, PPTX, DOCX, ZIP</strong> (Max 50MB)
              </Typography>
            </Box>
          )}
        </Box>

        {/* Bottom Right Upload Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleUploadSubmit}
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <IconPlus size={16} />}
            sx={{
              bgcolor: '#0085db',
              color: '#ffffff',
              px: 3,
              py: 1,
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.88rem',
              '&:hover': { bgcolor: '#006cb3' },
            }}
          >
            {uploading ? 'Uploading...' : 'Upload Material'}
          </Button>
        </Box>
      </Card>

      {/* 3. Currently Uploaded Documents List */}
      <Card
        elevation={0}
        sx={{
          bgcolor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          p: { xs: 2.5, sm: 3 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
            mb: 2,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#111c2d' }}>
            Uploaded Documents ({displayedDocuments.length})
          </Typography>

          {/* Filter Pills */}
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {(['all', 'syllabus', 'pyq', 'ip', 'notes', 'ppt', 'other'] as const).map((ft) => (
              <Chip
                key={ft}
                label={ft === 'all' ? 'All' : documentTypeLabels[ft].label}
                size="small"
                onClick={() => setFilterType(ft)}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  height: '24px',
                  bgcolor: filterType === ft ? '#111c2d' : '#f1f5f9',
                  color: filterType === ft ? '#ffffff' : '#64748b',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: filterType === ft ? '#0f172a' : '#e2e8f0',
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Clean Table */}
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: '12px' }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }}>NAME</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }}>TYPE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }}>UNIT</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }}>SIZE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }}>DATE</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }}>
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 4, textAlign: 'center', color: '#94a3b8' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      No documents found for this filter.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                displayedDocuments.map((doc) => {
                  const typeCfg = documentTypeLabels[doc.type];

                  return (
                    <TableRow key={doc.id} hover>
                      <TableCell sx={{ py: 1.25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getDocIcon(doc.fileFormat)}
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: '#1e293b',
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              '&:hover': { color: '#0085db' },
                            }}
                            onClick={() => {
                              setPreviewDoc(doc);
                              setPreviewOpen(true);
                            }}
                          >
                            {doc.name}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={typeCfg.label}
                          sx={{
                            height: '20px',
                            bgcolor: typeCfg.bgColor,
                            color: typeCfg.color,
                            fontWeight: 700,
                            fontSize: '0.68rem',
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ fontSize: '0.8rem', color: '#475569' }}>
                        {doc.unitModule}
                      </TableCell>

                      <TableCell sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {doc.fileSize}
                      </TableCell>

                      <TableCell sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {doc.uploadedAt}
                      </TableCell>

                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Tooltip title="Preview">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setPreviewDoc(doc);
                                setPreviewOpen(true);
                              }}
                              sx={{ color: '#0085db', p: 0.5 }}
                            >
                              <IconEye size={16} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Download">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setPreviewDoc(doc);
                                setPreviewOpen(true);
                              }}
                              sx={{ color: '#64748b', p: 0.5, '&:hover': { color: '#0085db' } }}
                            >
                              <IconDownload size={16} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => onDeleteDocument(selectedCourse.courseCode, doc.id)}
                              sx={{ color: '#dc2626', p: 0.5 }}
                            >
                              <IconTrash size={16} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* 4. Preview Modal */}
      <DocumentPreviewModal
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewDoc(null);
        }}
        document={previewDoc}
      />
    </Box>
  );
}
