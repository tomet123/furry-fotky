'use client';

import React, { useRef } from 'react';
import { Button } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

// Definice typů pro props
interface UploadImageButtonProps {
  onImageUpload: (file: File) => Promise<void>;
}

/**
 * Komponenta pro tlačítko nahrávání obrázků do editoru profilu
 */
const UploadImageButton = ({ onImageUpload }: UploadImageButtonProps) => {
  // Reference na input element pro výběr souboru
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Funkce pro zpracování kliknutí na tlačítko
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Funkce pro zpracování změny souboru
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Kontrola typu souboru
      if (!file.type.startsWith('image/')) {
        alert('Prosím vyberte obrázek.');
        return;
      }
      
      // Kontrola velikosti souboru (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Obrázek je příliš velký. Maximální velikost je 5MB.');
        return;
      }
      
      // Odeslat soubor pomocí předané funkce
      await onImageUpload(file);
      
      // Vyčistit hodnotu inputu pro opětovné nahrání stejného souboru
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<AddPhotoAlternateIcon />}
        onClick={handleButtonClick}
        sx={{ mr: 1, mb: 1 }}
      >
        Nahrát obrázek
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </>
  );
};

export default UploadImageButton; 