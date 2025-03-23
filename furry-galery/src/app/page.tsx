import { Metadata } from "next";
import { Box, Container, Typography, Button, Stack, Divider, Paper } from "@mui/material";
import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import UpcomingEventsSection from "@/components/home/UpcomingEventsSection";
import TopPhotographersSection from "@/components/home/TopPhotographersSection";
import { HomeCarousel } from "@/components/foto/HomeCarousel";

export const metadata: Metadata = {
  title: "Furry Fotky - Komunita pro sdílení fotografií z akcí",
  description: "Najděte fotky z vašich oblíbených furry akcí a setkejte se s talentovanými fotografy",
};

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Carousel s nejoblíbenějšími fotkami */}
      <HomeCarousel 
        title="Objevte a sdílejte fotky z nejlepších furry akcí"
        subtitle="Komunita fotografů a organizátorů, kde najdete fotky ze všech zajímavých akcí na jednom místě."
      />
      
      {/* Sekce s nadcházejícími událostmi */}
      <Box sx={{ mb: 6, mt: 6 }}>
        <UpcomingEventsSection />
      </Box>
      
      <Divider sx={{ mb: 6 }} />
      
      {/* Sekce s nejlepšími fotografy */}
      <Box sx={{ mb: 6 }}>
        <TopPhotographersSection />
      </Box>
    </Container>
  );
}
