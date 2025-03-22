'use client';

import { Avatar, AvatarProps } from '@mui/material';
import { useMemo } from 'react';

// Vyhýbáme se použití dynamické URL s window
const getAvatarUrl = (avatarId?: number | null) => {
  if (!avatarId) return undefined;
  return `/api/avatars/${avatarId}`;
};

interface UserAvatarProps extends Omit<AvatarProps, 'src'> {
  avatarId?: number | null;
  username?: string;
  size?: number;
  src?: string; // Přidáme prop src pro případ, kdy chceme přímo zadat URL
}

export default function UserAvatar({ 
  avatarId, 
  username = '', 
  size = 40,
  src,
  sx = {},
  ...props 
}: UserAvatarProps) {
  
  // Generování URL pro avatar z ID, pokud existuje a není zadán přímo src
  // Nepoužíváme dynamické hodnoty jako Date.now() které by způsobily hydration chyby
  const avatarSrc = useMemo(() => {
    if (src) {
      return src; // Pokud je zadán přímo src, použijeme ho
    }
    return getAvatarUrl(avatarId);
  }, [avatarId, src]);
  
  // První písmeno uživatelského jména jako fallback
  const firstLetter = username ? username[0].toUpperCase() : 'U';
  
  return (
    <Avatar
      src={avatarSrc}
      alt={username || 'Uživatel'}
      sx={{
        width: size,
        height: size,
        fontSize: `${size / 2.5}px`,
        bgcolor: 'primary.main',
        ...sx
      }}
      {...props}
    >
      {firstLetter}
    </Avatar>
  );
} 