'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7B68EE', // Medium Slate Blue
      light: '#9C8FFF',
      dark: '#5A4FC9',
    },
    secondary: {
      main: '#3498db', // Modrá
      light: '#5dade2',
      dark: '#2980b9',
    },
    background: {
      default: '#121212', // Velmi tmavá šedá, téměř černá
      paper: '#1E1E1E',   // Tmavá šedá pro komponenty
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E1E1E', // Stejná barva jako background.paper
        },
      },
    },
  },
});

export default theme;