'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Divider,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  IconX,
  IconDownload,
  IconCopy,
  IconCheck,
  IconEye,
  IconFileTypePdf,
  IconFileTypePpt,
  IconFileTypeDocx,
  IconPrinter,
  IconShare,
  IconBook2,
} from '@tabler/icons-react';
import { SLMDocument, documentTypeLabels } from '../../mock/slmMockData';

interface DocumentPreviewModalProps {
  open: boolean;
  onClose: () => void;
  document: SLMDocument | null;
  onDownload?: (doc: SLMDocument) => void;
}

export default function DocumentPreviewModal({
  open,
  onClose,
  document,
  onDownload,
}: DocumentPreviewModalProps) {
  const [copied, setCopied] = useState(false);

  if (!document) return null;

  const typeConfig = documentTypeLabels[document.type];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://ums.lpu.co.in/slm/preview/${document.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFormatIcon = () => {
    switch (document.fileFormat) {
      case 'pdf':
        return <IconFileTypePdf size={28} color="#dc2626" />;
      case 'pptx':
        return <IconFileTypePpt size={28} color="#ea580c" />;
      case 'docx':
        return <IconFileTypeDocx size={28} color="#2563eb" />;
      default:
        return <IconBook2 size={28} color="#0085db" />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px',
            p: 1,
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* Modal Header */}
      <DialogTitle sx={{ px: 3, pt: 2.5, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {getFormatIcon()}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                size="small"
                label={typeConfig.label}
                sx={{
                  bgcolor: typeConfig.bgColor,
                  color: typeConfig.color,
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  border: `1px solid ${typeConfig.borderColor}`,
                }}
              />
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                {document.courseCode} • {document.unitModule}
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#111c2d', mt: 0.25, fontSize: '1.1rem' }}>
              {document.name}
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={onClose} size="small" sx={{ color: '#64748b' }}>
          <IconX size={20} />
        </IconButton>
      </DialogTitle>

      <Divider />

      {/* Modal Body / Document Preview Area */}
      <DialogContent sx={{ px: 3, py: 2.5 }}>
        {/* Metadata summary bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            p: 1.75,
            bgcolor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #edf2f7',
            mb: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              <strong>File:</strong> {document.fileName} ({document.fileSize})
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              <strong>Uploaded By:</strong> {document.uploadedBy}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              <strong>Date:</strong> {document.uploadedAt}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              <strong>Downloads:</strong> {document.downloadsCount}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={copied ? 'Link Copied!' : 'Copy Preview Link'}>
              <Button
                size="small"
                variant="outlined"
                onClick={handleCopyLink}
                startIcon={copied ? <IconCheck size={14} color="#16a34a" /> : <IconCopy size={14} />}
                sx={{
                  fontSize: '0.75rem',
                  borderRadius: '8px',
                  borderColor: '#cbd5e1',
                  color: '#475569',
                }}
              >
                {copied ? 'Copied' : 'Share'}
              </Button>
            </Tooltip>
          </Box>
        </Box>

        {/* Realistic Mock Viewer Surface */}
        <Paper
          elevation={0}
          sx={{
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            p: { xs: 2.5, sm: 3.5 },
            minHeight: '340px',
            maxHeight: '440px',
            overflowY: 'auto',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.02)',
          }}
        >
          {/* Header watermark */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, pb: 2, borderBottom: '2px solid #f1f5f9' }}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#0085db', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Lovely Professional University • Academic Support Portal
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                {document.courseCode}: Self Learning Material (SLM)
              </Typography>
            </Box>
            <Chip
              label={document.fileFormat.toUpperCase()}
              size="small"
              sx={{ fontWeight: 800, bgcolor: '#0f172a', color: '#ffffff' }}
            />
          </Box>

          {/* Document Content Display */}
          {document.description && (
            <Box sx={{ mb: 3, p: 2, bgcolor: '#f0f9ff', borderRadius: '10px', borderLeft: '4px solid #0284c7' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0369a1', mb: 0.5 }}>
                Material Summary & Purpose:
              </Typography>
              <Typography variant="body2" sx={{ color: '#334155' }}>
                {document.description}
              </Typography>
            </Box>
          )}

          {document.sampleContent?.sections && document.sampleContent.sections.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {document.sampleContent.sections.map((sec, i) => (
                <Box key={i} sx={{ p: 2, bgcolor: '#fafafa', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
                    {sec.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6 }}>
                    {sec.content}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <IconEye size={48} color="#94a3b8" style={{ marginBottom: 12, opacity: 0.7 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                Document Preview Ready ({document.fileFormat.toUpperCase()} Viewer)
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 450, mx: 'auto', mt: 0.5 }}>
                This file is validated and ready for students registered in {document.courseCode}. Click &quot;Download Copy&quot; below to access full offline document.
              </Typography>
            </Box>
          )}
        </Paper>
      </DialogContent>

      <Divider />

      {/* Modal Actions */}
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            borderRadius: '10px',
            borderColor: '#e2e8f0',
            color: '#64748b',
            '&:hover': { borderColor: '#cbd5e1' },
          }}
        >
          Close Preview
        </Button>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            onClick={() => {
              if (onDownload) onDownload(document);
              onClose();
            }}
            startIcon={<IconDownload size={18} />}
            sx={{
              borderRadius: '10px',
              bgcolor: '#0085db',
              px: 3,
              fontWeight: 700,
              '&:hover': { bgcolor: '#006cb3' },
            }}
          >
            Download Copy ({document.fileSize})
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
