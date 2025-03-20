'use client';

import { useState, useCallback, memo } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Link from 'next/link';

// Použijeme symbol pro menu místo ikony, abychom vyřešili problém s importem
const MenuSymbol = () => (
  <Typography sx={{ fontSize: '24px', lineHeight: 1 }}>☰</Typography>
);

// Navigační odkazy pro menu - memoizované
const pages = [
  { title: 'Domů', path: '/' },
  { title: 'Fotky', path: '/photos' },
  { title: 'Akce', path: '/events' },
  { title: 'Fotografové', path: '/photographers' },
  { title: 'O nás', path: '/about' },
];

// Položky uživatelského menu - memoizované
const settings = [
  { title: 'Profil', href: '/profile' },
  { title: 'Nastavení', href: '/settings' },
  { title: 'Odhlásit se', href: '/logout' },
];

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Stav pro uživatelské menu
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  // Stav pro mobilní menu
  const [mobileOpen, setMobileOpen] = useState(false);

  // Funkce pro otevření/zavření uživatelského menu - memoizované
  const handleOpenUserMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  }, []);

  const handleCloseUserMenu = useCallback(() => {
    setAnchorElUser(null);
  }, []);

  // Funkce pro přepínání mobilního menu - memoizováno
  const handleDrawerToggle = useCallback(() => {
    setMobileOpen((prevState) => !prevState);
  }, []);

  // Obsah mobilního menu - memoizované
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, color: 'primary.main' }}>
        FurryFotky.cz
      </Typography>
      <Divider />
      <List>
        {pages.map((page) => (
          <ListItem key={page.title} disablePadding>
            <ListItemButton
              component={Link}
              href={page.path}
              sx={{ 
                textAlign: 'center',
                '&:hover': {
                  bgcolor: 'rgba(144, 202, 249, 0.08)',
                }
              }}
            >
              <ListItemText 
                primary={page.title} 
                primaryTypographyProps={{ 
                  fontWeight: 'medium' 
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar position="static" elevation={0}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo a název pro desktop */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
            }}
          >
            FurryFotky.cz
          </Typography>

          {/* Menu ikona pro mobilní zařízení */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleDrawerToggle}
              color="inherit"
            >
              <MenuSymbol />
            </IconButton>
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true, // Pro lepší výkon na mobilních zařízeních
              }}
              sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiDrawer-paper': { 
                  boxSizing: 'border-box', 
                  width: 240,
                  backgroundColor: 'background.paper',
                },
              }}
            >
              {drawer}
            </Drawer>
          </Box>

          {/* Logo a název pro mobilní zařízení */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
            }}
          >
            FurryFotky.cz
          </Typography>

          {/* Navigační odkazy pro desktop */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.title}
                component={Link}
                href={page.path}
                sx={{ 
                  my: 2, 
                  color: 'white', 
                  display: 'block',
                  mx: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(144, 202, 249, 0.08)',
                    color: 'primary.light',
                  },
                }}
              >
                {page.title}
              </Button>
            ))}
          </Box>

          {/* Uživatelské menu */}
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Otevřít menu">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar 
                  alt="Uživatel" 
                  src="/images/avatar.jpg"
                  sx={{ 
                    bgcolor: 'primary.dark',
                    border: '2px solid',
                    borderColor: 'background.paper',
                  }}
                >
                  U
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              PaperProps={{
                elevation: 3,
                sx: {
                  backgroundColor: 'background.paper',
                  borderRadius: 1,
                  minWidth: 180,
                }
              }}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting.title}
                  onClick={handleCloseUserMenu}
                  component={Link}
                  href={setting.href}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(144, 202, 249, 0.08)',
                    },
                  }}
                >
                  <Typography textAlign="center">{setting.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

// Použití memo pro optimalizaci renderování
export default memo(Header); 