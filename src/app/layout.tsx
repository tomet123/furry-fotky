import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { Box, Container } from "@mui/material";

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
      <body className={roboto.className}>
        <ThemeRegistry>
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
              }}
            >
              {children}
            </Container>
            <Footer />
          </Box>
        </ThemeRegistry>
      </body>
    </html>
  );
}
