'use client';

import React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  Avatar,
  Card,
  CardContent,
  Stack,
  Skeleton,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import CameraIcon from '@mui/icons-material/Camera';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import EditIcon from '@mui/icons-material/Edit';
import Link from 'next/link';
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';
import EventCard, { EventData } from '@/components/events/EventCard';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Typ pro fotografa s jeho uživatelskými daty
interface PhotographerWithUser {
  id: string;
  userId: string | null;
  bio: string | null;
  description: string | null;
  isBeginner: boolean;
  createdAt: Date | null;
  stats: {
    galleryCount: number;
    photoCount: number;
    eventCount: number;
  };
  events: {
    eventId: string | null;
    eventName: string | null;
    eventDate: string | null;
    photoCount: number;
  }[];
  user: {
    id: string;
    username: string;
    name: string | null;
  } | null;
}

interface PhotographerDetailClientProps {
  photographer: PhotographerWithUser;
}

export default function PhotographerDetailClient({ photographer }: PhotographerDetailClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  
  // Formátování data vytvoření profilu
  const formattedDate = photographer.createdAt
    ? new Date(photographer.createdAt).toLocaleDateString('cs-CZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Neznámé datum';
  
  // Mapování dat fotografa na formát EventData pro komponentu EventCard
  const mapToEventData = (event: PhotographerWithUser['events'][0], index: number): EventData => ({
    id: event.eventId,
    name: event.eventName,
    date: event.eventDate,
    photoCount: event.photoCount,
    photographerId: photographer.id,
    photographerName: photographer.user?.username || photographer.user?.name || ''
  });

  // Kontrola, zda je aktuální uživatel na svém profilu
  const isOwnProfile = session?.user?.id === photographer.userId;
  
  return (
    <Container maxWidth="lg">
      {/* Horní lišta s tlačítky */}
      <Box sx={{ 
        my: 2, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          variant="text"
          color="inherit"
        >
          Zpět
        </Button>

        {isOwnProfile && (
          <Tooltip title="Upravit profil">
            <IconButton
              onClick={() => router.push(`/uzivatele/fotograf/${photographer.id}/edit`)}
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' }
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      <Grid container spacing={4}>
        {/* Levý sloupec - Informace o fotografovi */}
        <Grid item xs={12} md={4}>
          <Card>
            <Box
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Avatar fotografa */}
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: 'primary.main',
                  mb: 2,
                }}
              >
                <PersonIcon fontSize="large" />
              </Avatar>
              
              {/* Jméno fotografa */}
              <Typography variant="h5" component="h1" align="center" gutterBottom>
                {photographer.user?.username || 'Neznámý fotograf'}
              </Typography>
              
              {/* Bio fotografa */}
              <Typography variant="body1" color="text.secondary" align="center" paragraph>
                {photographer.bio || 'Žádné bio nebylo vyplněno'}
              </Typography>
              
              {/* Štítek pro zkušenost */}
              <Chip
                label={photographer.isBeginner ? 'Začínající fotograf' : 'Zkušený fotograf'}
                color={photographer.isBeginner ? 'secondary' : 'primary'}
                sx={{ mt: 1 }}
              />
            </Box>
            
            <Divider />
            
            {/* Statistiky fotografa */}
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistiky
              </Typography>
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CameraIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1">
                    Fotografií: {photographer.stats.photoCount}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1">
                    Akcí: {photographer.stats.eventCount}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarMonthIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1">
                    Profil vytvořen: {formattedDate}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Pravý sloupec - Markdown popis a galerie */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              O fotografovi
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              {photographer.description ? (
                <MarkdownRenderer content={photographer.description} />
              ) : (
                <Typography color="text.secondary" variant="body1">
                  Tento fotograf nemá vyplněný popis.
                </Typography>
              )}
            </Box>
          </Paper>
          
          {/* Seznam akcí, na kterých fotograf fotil - zobrazené jako dlaždice */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Akce ({photographer.stats.eventCount})
            </Typography>
            
            {photographer.events && photographer.events.length > 0 ? (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {photographer.events.map((event, index) => (
                  <Grid item xs={12} sm={6} key={event.eventId || index}>
                    <EventCard 
                      event={mapToEventData(event, index)} 
                      index={index}
                      showPhotosButton={true}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary" variant="body1">
                Tento fotograf zatím nemá fotografie z žádných akcí.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 