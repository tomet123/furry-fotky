import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Roboto } from 'next/font/google';
import { ThemeProvider } from '@mui/material/styles';
import { Box, Container, CssBaseline } from '@mui/material';
import theme from '../theme';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthProvider from '../providers/AuthProvider';
import './globals.css';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export const metadata = {
  title: 'FurryFotky.cz - Fotogalerie',
  description: 'Fotogalerie a komunita pro milovníky furry',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
};

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;
  return (
    <html lang="cs">
      <body className={roboto.variable}>
        <AppRouterCacheProvider>
          <AuthProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '100vh',
                }}
              >
                <Header />
                <Box
                  component="main"
                  sx={{
                    flexGrow: 1,
                    py: 3,
                  }}
                >
                  {children}
                </Box>
                <Footer />
              </Box>
            </ThemeProvider>
          </AuthProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
