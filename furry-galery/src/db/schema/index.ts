import { photographers, organizers } from "./users";
import { events, tags } from "./events";
import { photos, storagePhotos, storageProfilePictures, photoTags, photoLikes } from "./photos";
import { user, account, session, verificationToken } from "./auth";
import { photographerTakeoverRequests } from "./requests";
import { markdownImages } from "./markdown";

export {
  // NextAuth.js tabulky
  user,
  account,
  session,
  verificationToken,
  
  // Uživatelské role
  photographers,
  organizers,
  
  // Události
  events,
  tags,
  
  // Fotografie a úložiště
  photos,
  storagePhotos,
  storageProfilePictures,
  photoTags,
  photoLikes,
  
  // Žádosti
  photographerTakeoverRequests,
  
  // Markdown obrázky
  markdownImages,
};
