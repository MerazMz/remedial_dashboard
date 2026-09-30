'use client';

import React from 'react';
import { Box } from '@mui/material';

export default function UmsLogo({ height = 32 }: { height?: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', userSelect: 'none', cursor: 'pointer' }}>
      <Box
        component="img"
        src="/images/logos/umslogo.png"
        alt="UMS Logo"
        sx={{
          height: `${height}px`,
          width: 'auto',
          maxHeight: '45px',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </Box>
  );
}
