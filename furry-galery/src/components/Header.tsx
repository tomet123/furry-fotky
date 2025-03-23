'use client';
import { AppBar, Toolbar, Typography, Button, Box, Container, Tabs, Tab, Avatar, Menu, MenuItem, IconButton } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import PersonIcon from '@mui/icons-material/Person';

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

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

  // Zjištění aktivní záložky podle aktuální cesty
  const getTabValue = () => {
    if (pathname === '/fotogalerie' || pathname?.startsWith('/fotogalerie/')) return 0;
    if (pathname === '/akce') return 1;
    if (pathname === '/uzivatele') return 2;
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

          {/* Přihlášení/Odhlášení */}
          <Box>
            {status === 'authenticated' && session?.user ? (
              <>
                <IconButton
                  onClick={handleClick}
                  size="small"
                  aria-controls={open ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    {session.user.name?.charAt(0).toUpperCase() || <PersonIcon />}
                  </Avatar>
                </IconButton>
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
                      Přihlášen jako: <strong>{session.user.name}</strong>
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={handleClose} component={Link} href="/profil">
                    Můj profil
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Odhlásit se</MenuItem>
                </Menu>
              </>
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
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
} 