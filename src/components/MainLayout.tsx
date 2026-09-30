'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Avatar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Badge,
  InputBase,
  Fab,
  Button,
  Chip,
} from '@mui/material';
import {
  IconSearch,
  IconMoon,
  IconSun,
  IconBell,
  IconBug,
  IconSettings,
  IconNotebook,
  IconSchool,
  IconLogout,
  IconUpload,
  IconUser,
  IconShieldCheck,
} from '@tabler/icons-react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import UmsLogo from './UmsLogo';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.includes('upload-slm');

  const handleProfileOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F0F5F9' }}>
      {/* 1. Top Header Bar (White with UMS Logo & User controls) */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e5eaef',
          color: 'text.primary',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ height: '70px', justifyContent: 'space-between' }}>
            {/* Logo and Brand */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <NextLink href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                <UmsLogo height={25} />
              </NextLink>
              <Box
                sx={{
                  display: { xs: 'none', md: 'block' },
                  height: '24px',
                  width: '1px',
                  bgcolor: '#e5eaef',
                }}
              />
              <Typography
                variant="subtitle2"
                sx={{
                  display: { xs: 'none', md: 'block' },
                  fontWeight: 700,
                  color: '#0085db',
                  bgcolor: '#e5f3fb',
                  px: 1.5,
                  py: 0.4,
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                {isAdminRoute ? 'Admin Portal' : 'Academic Support Portal'}
              </Typography>
            </Box>

            {/* Header Right Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
              {/* Search Pill Input */}
              <Box
                sx={{
                  display: { xs: 'none', lg: 'flex' },
                  alignItems: 'center',
                  bgcolor: '#ffffff',
                  border: '1px solid #dfe5ef',
                  borderRadius: '30px',
                  px: 2,
                  py: 0.5,
                  width: '210px',
                  transition: 'all 0.2s ease',
                  '&:focus-within': {
                    borderColor: 'primary.main',
                    boxShadow: '0 0 0 3px rgba(0, 133, 219, 0.12)',
                    width: '250px',
                  },
                }}
              >
                <IconSearch size={18} color="#7c8fac" style={{ marginRight: '8px' }} />
                <InputBase
                  placeholder="Search Courses / SLM"
                  sx={{
                    fontSize: '0.85rem',
                    color: '#111c2d',
                    width: '100%',
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                  }}
                />
              </Box>

              {/* Dark Mode Toggle */}
              <Tooltip title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
                <IconButton
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  sx={{
                    color: '#111c2d',
                    bgcolor: 'transparent',
                    p: 1,
                    '&:hover': { bgcolor: '#f0f5f9' },
                  }}
                >
                  {isDarkMode ? <IconSun size={22} /> : <IconMoon size={22} />}
                </IconButton>
              </Tooltip>

              {/* Notifications */}
              <Tooltip title="Notifications">
                <IconButton
                  sx={{
                    color: '#111c2d',
                    p: 1,
                    '&:hover': { bgcolor: '#f0f5f9' },
                  }}
                >
                  <Badge
                    badgeContent={4}
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: '#0085db',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.68rem',
                        height: '18px',
                        minWidth: '18px',
                      },
                    }}
                  >
                    <IconBell size={22} />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* User Profile */}
              <Box
                onClick={handleProfileOpen}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  cursor: 'pointer',
                  p: 0.5,
                  borderRadius: '10px',
                  transition: 'bgcolor 0.2s',
                  '&:hover': { bgcolor: '#f0f5f9' },
                }}
              >
                <Avatar
                  src={
                    isAdminRoute
                      ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&h=120&q=80'
                      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'
                  }
                  alt="Profile"
                  sx={{
                    width: 38,
                    height: 38,
                    border: '2px solid #e5eaef',
                  }}
                >
                  {isAdminRoute ? 'AD' : 'RS'}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: '#111c2d',
                      fontSize: '0.88rem',
                      lineHeight: 1.2,
                    }}
                  >
                    {isAdminRoute ? 'Prof. Coordinator' : 'Subhadeep Mondal'}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: isAdminRoute ? '#0085db' : 'text.secondary',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                    }}
                  >
                    {isAdminRoute ? 'Role: Faculty Admin' : 'Reg: 12500078'}
                  </Typography>
                </Box>
              </Box>

              {/* Profile Dropdown Menu */}
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                  paper: {
                    sx: {
                      width: '260px',
                      p: 1,
                      mt: 1,
                      borderRadius: '14px',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                    },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {isAdminRoute ? 'Prof. Academic Coordinator' : 'Subhadeep Mondal'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {isAdminRoute ? 'Emp ID: E11940 • School of Design' : 'M.Design (UI/UX) • Reg: 12500078'}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />

                <NextLink href="/" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                  <MenuItem onClick={handleProfileClose} selected={!isAdminRoute}>
                    <IconSchool size={18} style={{ marginRight: '10px', color: '#0085db' }} /> Student Portal View
                  </MenuItem>
                </NextLink>

                <NextLink href="/admin" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                  <MenuItem onClick={handleProfileClose} selected={isAdminRoute}>
                    <IconUpload size={18} style={{ marginRight: '10px', color: '#0085db' }} /> Admin Portal View
                  </MenuItem>
                </NextLink>

                <MenuItem onClick={handleProfileClose}>
                  <IconNotebook size={18} style={{ marginRight: '10px', color: '#64748b' }} /> Attendance Portal
                </MenuItem>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={handleProfileClose} sx={{ color: 'error.main' }}>
                  <IconLogout size={18} style={{ marginRight: '10px' }} /> Log out
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Body Content Container */}
      <Box component="main" sx={{ flexGrow: 1, py: { xs: 2.5, md: 3.5 } }}>
        <Container maxWidth="xl">{children}</Container>
      </Box>

      {/* Floating Action Buttons */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          zIndex: 1000,
        }}
      >
        <Tooltip title="Help & Feedback" placement="left">
          <Fab
            size="medium"
            sx={{
              bgcolor: '#0085db',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(0, 133, 219, 0.4)',
              '&:hover': { bgcolor: '#006cb3' },
            }}
          >
            <IconBug size={22} />
          </Fab>
        </Tooltip>
        <Tooltip title="Portal Settings" placement="left">
          <Fab
            size="medium"
            sx={{
              bgcolor: '#0085db',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(0, 133, 219, 0.4)',
              '&:hover': { bgcolor: '#006cb3' },
            }}
          >
            <IconSettings size={22} />
          </Fab>
        </Tooltip>
      </Box>
    </Box>
  );
}
