'use client';
import { AppBar, Toolbar, Typography, Button, Box, Container, Tabs, Tab, Avatar, Menu, MenuItem, IconButton, Stack, Drawer, List, Divider, useTheme, useMediaQuery, CircularProgress } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Menu pro přihlášeného uživatele
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    signOut({ redirect: false });
    handleClose();
  };

  // Otevření/zavření mobilního menu
  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Zavření mobilního menu po výběru
  const handleMenuItemClick = () => {
    setMobileMenuOpen(false);
  };

  // Zjištění aktivní záložky podle aktuální cesty
  const getTabValue = () => {
    if (pathname === '/fotogalerie' || pathname?.startsWith('/fotogalerie/')) return 0;
    if (pathname === '/akce') return 1;
    if (pathname === '/uzivatele') return 2;
    return false;
  };

  // Stylové konstanty pro mobilní menu
  const menuItemStyle = {
    display: 'flex',
    alignItems: 'center',
    py: 1.5,
    px: 3,
    color: 'text.primary',
    textDecoration: 'none',
    '&:hover': {
      bgcolor: 'action.hover',
    },
  };

  const activeMenuItemStyle = {
    ...menuItemStyle,
    bgcolor: 'action.selected',
    color: 'primary.main',
    '&:hover': {
      bgcolor: 'action.selected',
    },
  };

  const mobileMenu = (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={handleMobileMenuToggle}
      PaperProps={{
        sx: {
          width: 280,
          bgcolor: 'background.paper',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          FurryFotky.cz
        </Typography>
      </Box>
      <Divider />
      <Box component="nav" sx={{ mt: 2 }}>
        <Link 
          href="/fotogalerie" 
          onClick={handleMenuItemClick}
          style={{ textDecoration: 'none' }}
        >
          <Box 
            sx={pathname === '/fotogalerie' || pathname?.startsWith('/fotogalerie/') ? activeMenuItemStyle : menuItemStyle}
          >
            <PhotoLibraryIcon sx={{ mr: 2 }} color={getTabValue() === 0 ? "primary" : "inherit"} />
            <Typography>Fotografie</Typography>
          </Box>
        </Link>
        
        <Link 
          href="/akce" 
          onClick={handleMenuItemClick}
          style={{ textDecoration: 'none' }}
        >
          <Box 
            sx={pathname === '/akce' ? activeMenuItemStyle : menuItemStyle}
          >
            <EventIcon sx={{ mr: 2 }} color={getTabValue() === 1 ? "primary" : "inherit"} />
            <Typography>Akce</Typography>
          </Box>
        </Link>
        
        <Link 
          href="/uzivatele" 
          onClick={handleMenuItemClick}
          style={{ textDecoration: 'none' }}
        >
          <Box 
            sx={pathname === '/uzivatele' ? activeMenuItemStyle : menuItemStyle}
          >
            <PeopleIcon sx={{ mr: 2 }} color={getTabValue() === 2 ? "primary" : "inherit"} />
            <Typography>Uživatelé</Typography>
          </Box>
        </Link>
      </Box>
    </Drawer>
  );

  return (
    <AppBar position="static" color="transparent" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Mobilní hamburger menu */}
          {isMobile && (
            <IconButton 
              edge="start" 
              color="inherit" 
              aria-label="menu"
              onClick={handleMobileMenuToggle}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography
              variant="h5"
              component="div"
              fontWeight="bold"
              sx={{ display: 'flex', flexShrink: 0 }}
            >
              FurryFotky.cz
            </Typography>
          </Link>

          {/* Hlavní navigace - zobrazena jen na větších obrazovkách */}
          <Tabs 
            value={getTabValue()} 
            textColor="inherit"
            indicatorColor="secondary"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' }, mx: 2 }}
          >
            <Tab 
              label="Fotografie" 
              component={Link} 
              href="/fotogalerie" 
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

          {/* Přihlášení/Odhlášení - optimalizováno pro všechny velikosti obrazovky */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {status === 'loading' ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={24} color="inherit" sx={{ mr: isMobile ? 0 : 1 }} />
                {!isMobile && (
                  <Typography variant="body2">
                    Načítání...
                  </Typography>
                )}
              </Box>
            ) : status === 'authenticated' && session?.user ? (
              <>
                <Stack direction="row" spacing={1} alignItems="center">
                  {/* Zobrazení uživatelského jména vedle avataru */}
                  <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                    {session.user.username || session.user.name}
                  </Typography>
                  
                  <IconButton
                    onClick={handleClick}
                    size="small"
                    aria-controls={open ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                  >
                    {/* Použití skutečného profilového obrázku */}
                    <Avatar 
                      src={session.user.id ? `/api/profile-pictures/${session.user.id}` : undefined}
                      sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}
                    >
                      {!session.user.id && (session.user.name?.charAt(0).toUpperCase() || <PersonIcon />)}
                    </Avatar>
                  </IconButton>
                </Stack>
                
                <Menu
                  id="account-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem disabled>
                    <Typography variant="body2">
                      Přihlášen jako: <strong>{session.user.username || session.user.name}</strong>
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={handleClose} component={Link} href="/user/profile">
                    Můj profil
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Odhlásit se</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                {isMobile ? (
                  <Button variant="contained" color="secondary" component={Link} href="/login" size="small">
                    Přihlásit
                  </Button>
                ) : (
                  <>
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
                  </>
                )}
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
      {mobileMenu}
    </AppBar>
  );
} 