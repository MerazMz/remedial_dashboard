import { createTheme } from '@mui/material/styles';
import { Plus_Jakarta_Sans } from 'next/font/google';

export const plus = Plus_Jakarta_Sans({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  fallback: ['Helvetica', 'Arial', 'sans-serif'],
});

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0085db',
      light: '#e5f3fb',
      dark: '#006cb3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#707a82',
      light: '#e7ecf0',
      dark: '#4f565c',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F0F5F9',
      paper: '#ffffff',
    },
    text: {
      primary: '#111c2d',
      secondary: '#7c8fac',
    },
    success: {
      main: '#4bd08b',
      light: '#dffff3',
      dark: '#38b273',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f8c076',
      light: '#fff6ea',
      dark: '#df9e4c',
      contrastText: '#ffffff',
    },
    error: {
      main: '#fb977d',
      light: '#ffede9',
      dark: '#e07154',
      contrastText: '#ffffff',
    },
    info: {
      main: '#46caeb',
      light: '#e1f5fa',
      dark: '#2cb0d1',
      contrastText: '#ffffff',
    },
    divider: '#e5eaef',
  },
  typography: {
    fontFamily: plus.style.fontFamily,
    h1: {
      fontWeight: 700,
      fontSize: '2.25rem',
      lineHeight: '2.75rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.875rem',
      lineHeight: '2.25rem',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.5rem',
      lineHeight: '1.75rem',
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.3125rem',
      lineHeight: '1.6rem',
    },
    h5: {
      fontWeight: 700,
      fontSize: '1.125rem',
      lineHeight: '1.6rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: '1.2rem',
    },
    body1: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: '1.334rem',
    },
    body2: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: '1rem',
    },
    subtitle1: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 400,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          boxShadow: 'none',
          textTransform: 'none',
          fontWeight: 600,
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: '#0085db',
          '&:hover': {
            backgroundColor: '#006cb3',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5eaef',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: '16px',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          backgroundColor: '#f8fafc',
          color: '#111c2d',
          borderBottom: '1px solid #e5eaef',
          padding: '14px 16px',
        },
        root: {
          borderBottom: '1px solid #f0f5f9',
          padding: '14px 16px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: '8px',
        },
      },
    },
  },
});

export default theme;
