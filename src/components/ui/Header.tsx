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
  Stack,
} from '@mui/material';
import Link from 'next/link';
import { useAuthContext } from '@/components/context/AuthContext';
import { CARD_HOVER_BACKGROUND, MEDIUM_AVATAR_SIZE } from '@/lib/constants';
import UserAvatar from './UserAvatar';

// Stylové konstanty
const logoStyle = {
  fontWeight: 700,
  color: 'primary.main',
  textDecoration: 'none',
};

const menuItemHoverStyle = {
  backgroundColor: CARD_HOVER_BACKGROUND,
};

const navigationButtonStyle = {
  my: 2, 
  color: 'white', 
  display: 'block',
  mx: 1,
  '&:hover': {
    ...menuItemHoverStyle,
    color: 'primary.light',
  },
};

const menuItemStyle = {
  px: 2,
  py: 1,
  '&:hover': menuItemHoverStyle,
};

const menuPaperStyle = {
  backgroundColor: 'background.paper',
  borderRadius: 1,
  minWidth: 180,
};

// Použijeme symbol pro menu místo ikony, abychom vyřešili problém s importem
const MenuSymbol = () => (
  <Typography sx={{ fontSize: '24px', lineHeight: 1 }}>☰</Typography>
);

// Navigační odkazy pro menu
const pages = [
  { title: 'Domů', path: '/' },
  { title: 'Fotky', path: '/photos' },
  { title: 'Akce', path: '/events' },
  { title: 'Fotografové', path: '/photographers' },
];

// Menu pro fotografy
const photographerPages = [
  { title: 'Moje fotky', path: '/photographer/photos' },
  { title: 'Nahrát fotky', path: '/photographer/upload' },
  { title: 'Statistiky', path: '/photographer/stats' },
];

// Menu pro organizátory
const organizerPages = [
  { title: 'Moje akce', path: '/organizer/events' },
  { title: 'Vytvořit akci', path: '/organizer/events/new' },
  { title: 'Přehledy', path: '/organizer/dashboard' },
];

// Položky uživatelského menu
const userSettings = [
  { title: 'Profil', href: '/profile' },
  { title: 'Nastavení', href: '/settings' },
];

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated, logout } = useAuthContext();
  
  // Stav pro uživatelské menu
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  // Stav pro mobilní menu
  const [mobileOpen, setMobileOpen] = useState(false);

  // Funkce pro otevření/zavření uživatelského menu
  const handleOpenUserMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  }, []);

  const handleCloseUserMenu = useCallback(() => {
    setAnchorElUser(null);
  }, []);

  // Funkce pro přepínání mobilního menu
  const handleDrawerToggle = useCallback(() => {
    setMobileOpen((prevState) => !prevState);
  }, []);

  // Funkce pro odhlášení
  const handleLogout = useCallback(() => {
    logout();
    handleCloseUserMenu();
  }, [logout, handleCloseUserMenu]);

  // Obsah mobilního menu
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
                '&:hover': menuItemHoverStyle,
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

        {/* Menu pro fotografy v mobilním režimu */}
        {isAuthenticated && user?.photographer_id && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem>
              <ListItemText 
                primary="Fotograf" 
                primaryTypographyProps={{ 
                  fontWeight: 'bold',
                  color: 'primary.main',
                  textAlign: 'center'
                }}
              />
            </ListItem>
            {photographerPages.map((page) => (
              <ListItem key={page.title} disablePadding>
                <ListItemButton
                  component={Link}
                  href={page.path}
                  sx={{ 
                    textAlign: 'center',
                    '&:hover': menuItemHoverStyle,
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
          </>
        )}

        {/* Menu pro organizátory v mobilním režimu */}
        {isAuthenticated && user?.organizer_id && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem>
              <ListItemText 
                primary="Organizátor" 
                primaryTypographyProps={{ 
                  fontWeight: 'bold',
                  color: 'primary.main',
                  textAlign: 'center'
                }}
              />
            </ListItem>
            {organizerPages.map((page) => (
              <ListItem key={page.title} disablePadding>
                <ListItemButton
                  component={Link}
                  href={page.path}
                  sx={{ 
                    textAlign: 'center',
                    '&:hover': menuItemHoverStyle,
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
          </>
        )}

        {/* Menu pro adminy v mobilním režimu */}
        {isAuthenticated && user?.role === 'admin' && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/admin"
                sx={{ 
                  textAlign: 'center',
                  bgcolor: 'error.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'error.dark',
                  },
                }}
              >
                <ListItemText 
                  primary="Administrace" 
                  primaryTypographyProps={{ 
                    fontWeight: 'bold',
                  }}
                />
              </ListItemButton>
            </ListItem>
          </>
        )}
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
              ...logoStyle
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
              ...logoStyle
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
                sx={navigationButtonStyle}
              >
                {page.title}
              </Button>
            ))}

            {/* Menu pro fotografy */}
            {isAuthenticated && user?.photographer_id && (
              <>
                <Button
                  sx={{
                    ...navigationButtonStyle,
                    ml: 2,
                    borderLeft: '1px solid rgba(255,255,255,0.3)',
                  }}
                  component={Link}
                  href={photographerPages[0].path}
                >
                  Fotograf
                </Button>
                {photographerPages.slice(1).map((page) => (
                  <Button
                    key={page.title}
                    component={Link}
                    href={page.path}
                    sx={navigationButtonStyle}
                  >
                    {page.title}
                  </Button>
                ))}
              </>
            )}

            {/* Menu pro organizátory */}
            {isAuthenticated && user?.organizer_id && (
              <>
                <Button
                  sx={{
                    ...navigationButtonStyle,
                    ml: 2,
                    borderLeft: '1px solid rgba(255,255,255,0.3)',
                  }}
                  component={Link}
                  href={organizerPages[0].path}
                >
                  Organizátor
                </Button>
                {organizerPages.slice(1).map((page) => (
                  <Button
                    key={page.title}
                    component={Link}
                    href={page.path}
                    sx={navigationButtonStyle}
                  >
                    {page.title}
                  </Button>
                ))}
              </>
            )}

            {/* Menu pro adminy */}
            {isAuthenticated && user?.role === 'admin' && (
              <Button
                sx={{
                  ...navigationButtonStyle,
                  ml: 2,
                  borderLeft: '1px solid rgba(255,255,255,0.3)',
                  backgroundColor: 'error.main',
                  '&:hover': {
                    backgroundColor: 'error.dark',
                  }
                }}
                component={Link}
                href="/admin"
              >
                Administrace
              </Button>
            )}
          </Box>

          {/* Uživatelské menu nebo přihlašovací tlačítka */}
          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated ? (
              <>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  {isMobile ? null : (
                    <Typography variant="body2" color="white">
                      {user?.username}
                    </Typography>
                  )}
                  
                  <Tooltip title="Otevřít menu">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <UserAvatar 
                        avatarId={user?.avatar_id}
                        username={user?.username || 'Uživatel'} 
                        size={MEDIUM_AVATAR_SIZE}
                        sx={{ 
                          bgcolor: 'primary.dark',
                          border: '2px solid',
                          borderColor: 'background.paper',
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                </Stack>
                
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
                    sx: menuPaperStyle
                  }}
                >
                  {/* Hlavička menu s uživatelským jménem */}
                  <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <UserAvatar 
                      avatarId={user?.avatar_id}
                      username={user?.username || ''} 
                      size={40}
                      sx={{ bgcolor: 'primary.dark' }}
                    />
                    <Box>
                      <Typography 
                        variant="subtitle1" 
                        component="div" 
                        sx={{ fontWeight: 'bold' }}
                      >
                        {user?.username}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ wordBreak: 'break-all' }}
                      >
                        {user?.email}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider />
                  
                  {/* Položky menu */}
                  {userSettings.map((setting) => (
                    <MenuItem
                      key={setting.title}
                      onClick={handleCloseUserMenu}
                      component={Link}
                      href={setting.href}
                      sx={menuItemStyle}
                    >
                      <Typography textAlign="center">{setting.title}</Typography>
                    </MenuItem>
                  ))}
                  
                  <Divider />
                  
                  {/* Tlačítko odhlášení */}
                  <MenuItem 
                    onClick={handleLogout} 
                    sx={menuItemStyle}
                  >
                    <Typography textAlign="center">Odhlásit se</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  component={Link} 
                  href="/login"
                  variant="text"
                  color="inherit"
                  sx={{ 
                    '&:hover': menuItemHoverStyle,
                  }}
                >
                  Přihlásit
                </Button>
                <Button 
                  component={Link} 
                  href="/register"
                  variant="contained"
                  color="primary"
                  sx={{
                    fontWeight: 'bold',
                  }}
                >
                  Registrovat
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

// Použití memo pro optimalizaci renderování
export default memo(Header); 