'use client';

import React from 'react';
import { Typography, Breadcrumbs, Card, Box } from '@mui/material';
import NextLink from 'next/link';
import { IconPointFilled } from '@tabler/icons-react';

interface BreadCrumbItem {
  title: string;
  to?: string;
}

interface BreadcrumbProps {
  title: string;
  subtitle?: string;
  items?: BreadCrumbItem[];
}

export default function Breadcrumb({ title, subtitle, items = [] }: BreadcrumbProps) {
  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: '#ffffff',
        borderRadius: '16px',
        p: { xs: '18px 20px', md: '22px 28px' },
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        border: '1px solid #edf2f7',
      }}
    >
      {/* Left: Page Title & Subtitle */}
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: '#111c2d',
            fontSize: { xs: '1.25rem', md: '1.45rem' },
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* Right: Breadcrumb Path */}
      <Breadcrumbs
        separator={<IconPointFilled size={8} style={{ color: '#7c8fac', margin: '0 2px' }} />}
        aria-label="breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-li': {
            fontSize: '0.85rem',
            fontWeight: 500,
          },
        }}
      >
        <NextLink href="/" passHref style={{ textDecoration: 'none' }}>
          <Typography
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              fontSize: '0.85rem',
              '&:hover': { color: 'primary.main' },
            }}
          >
            Academic Portal
          </Typography>
        </NextLink>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return isLast ? (
            <Typography
              key={item.title}
              sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.85rem' }}
            >
              {item.title}
            </Typography>
          ) : item.to ? (
            <NextLink key={item.title} href={item.to} passHref style={{ textDecoration: 'none' }}>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.85rem',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                {item.title}
              </Typography>
            </NextLink>
          ) : (
            <Typography
              key={item.title}
              sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.85rem' }}
            >
              {item.title}
            </Typography>
          );
        })}
      </Breadcrumbs>
    </Card>
  );
}
