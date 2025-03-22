'use client';
import { AppBar, Toolbar, Typography, Button, Box, Container, Tabs, Tab } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  // Zjištění aktivní záložky podle aktuální cesty
  const getTabValue = () => {
    if (pathname === '/fotky' || pathname?.startsWith('/fotky/')) return 0;
    if (pathname === '/galerie') return 1;
    if (pathname === '/akce') return 2;
    if (pathname === '/uzivatele') return 3;
    return false;
  };

  return (
    <AppBar position="static" color="transparent" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography
              variant="h5"
              component="div"
              fontWeight="bold"
              sx={{ mr: 4 }}
            >
              FurryFotky.cz
            </Typography>
          </Link>

          {/* Hlavní navigace */}
          <Tabs 
            value={getTabValue()} 
            textColor="inherit"
            indicatorColor="secondary"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' } }}
          >
            <Tab 
              label="Fotografie" 
              component={Link} 
              href="/fotky" 
            />
            <Tab 
              label="Galerie" 
              component={Link} 
              href="/galerie" 
            />
            <Tab 
              label="Akce" 
              component={Link} 
              href="/akce" 
            />
            <Tab 
              label="Uživatelé" 
              component={Link} 
              href="/uzivatele" 
            />
          </Tabs>

          {/* Přihlášení a registrace */}
          <Box>
            <Button color="inherit" component={Link} href="/login">
              Přihlášení
            </Button>
            <Button 
              variant="contained" 
              color="secondary" 
              component={Link} 
              href="/register"
              sx={{ ml: 1 }}
            >
              Registrace
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
} 