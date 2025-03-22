import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { Box, Container } from "@mui/material";
import { AuthProvider } from "@/components/context/AuthContext";

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "FurryFotky.cz - Galerie furry fotografií",
  description: "Galerie fotografií, seznam akcí a fotografů pro furry komunitu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <head>
        <meta name="emotion-insertion-point" content="" />
      </head>
      <body className={roboto.className} suppressHydrationWarning>
        <ThemeRegistry>
          <AuthProvider>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
              }}
            >
              <Header />
              <Container
                component="main"
                sx={{
                  flexGrow: 1,
                  py: 4,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {children}
              </Container>
              <Footer />
            </Box>
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
