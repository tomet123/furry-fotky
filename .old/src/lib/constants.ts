/**
 * Centralizované konstanty pro celou aplikaci
 */

// Auth konstanty
export const JWT_STORAGE_KEY = 'furry_fotky_auth_token';
export const JWT_EXPIRES_IN = '7d';
export const BCRYPT_SALT_ROUNDS = 10;

// API konstanty
export const API_URL = '/api';

// UI konstanty
export const PHOTO_CAROUSEL_AUTOPLAY_INTERVAL = 5000; // v milisekundách
export const DEFAULT_AVATAR_SIZE = 300;
export const SMALL_AVATAR_SIZE = 35; // Zvětšeno z původních 24
export const MEDIUM_AVATAR_SIZE = 55; // Zvětšeno z původních 24
export const THUMBNAIL_ASPECT_RATIO = '75%'; // poměr stran 4:3

// Pagination konstanty
export const DEFAULT_PAGE_SIZE = 12;
export const DEFAULT_INITIAL_PAGE = 1;

// Sort konstanty
export const SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  MOST_LIKED: 'most_liked',
} as const;

// Styling konstanty
export const CARD_HOVER_TRANSFORM = 'translateY(-4px)';
export const CARD_HOVER_SHADOW = '0 6px 20px rgba(0, 0, 0, 0.1)';
export const CARD_HOVER_BACKGROUND = 'rgba(144, 202, 249, 0.08)'; 