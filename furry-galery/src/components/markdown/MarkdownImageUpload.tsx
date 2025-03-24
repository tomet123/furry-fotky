import React, { useState, useRef, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Paper
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import PhotoIcon from '@mui/icons-material/Photo';
import { useSnackbar } from 'notistack';

interface MarkdownImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
}

export const MarkdownImageUpload: React.FC<MarkdownImageUploadProps> = ({ 
  onImageUploaded 
}) => {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { enqueueSnackbar } = useSnackbar();
  
  // Vyčistí stav po zavření dialogu
  useEffect(() => {
    if (!open) {
      setPreviewUrl(null);
      setSelectedFile(null);
      setIsDragging(false);
    }
  }, [open]);
  
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
  // Handler pro výběr souboru
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
  };
  
  // Handler pro drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelected(file);
    } else {
      enqueueSnackbar('Nahrajte prosím obrázek (JPEG, PNG, GIF, WEBP).', { 
        variant: 'error' 
      });
    }
  };
  
  // Zpracování vybraného souboru
  const handleFileSelected = (file: File) => {
    // Velikost souboru (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      enqueueSnackbar('Maximální velikost obrázku je 2MB.', { 
        variant: 'error' 
      });
      return;
    }
    
    // Validace typu souboru
    if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
      enqueueSnackbar('Povolené typy: JPEG, PNG, GIF, WEBP.', { 
        variant: 'error' 
      });
      return;
    }
    
    // Vytvoření URL náhledu
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
  };
  
  // Nahrání souboru na server
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch('/api/markdown-images/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Chyba při nahrávání obrázku');
      }
      
      // Úspěšné nahrání
      enqueueSnackbar('Obrázek byl úspěšně nahrán a vložen do editoru.', { 
        variant: 'success' 
      });
      
      // Vložení URL do editoru a zavření modalu
      onImageUploaded(data.url);
      setOpen(false);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      enqueueSnackbar(
        error instanceof Error 
          ? error.message 
          : "Nastala neznámá chyba při nahrávání obrázku.", 
        { variant: 'error' }
      );
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <>
      <IconButton 
        onClick={handleOpen} 
        color="primary" 
        size="small" 
        aria-label="Nahrát obrázek"
        title="Nahrát obrázek"
      >
        <PhotoIcon fontSize="small" />
      </IconButton>
      
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Nahrát obrázek
          <IconButton
            aria-label="zavřít"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {!previewUrl ? (
            // Oblast pro přetažení souboru
            <Box
              sx={{
                border: isDragging ? '2px dashed #3f51b5' : '2px dashed #ccc',
                borderRadius: 1,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                mt: 2,
                backgroundColor: isDragging ? 'rgba(63, 81, 181, 0.05)' : 'transparent',
                transition: 'all 0.2s ease'
              }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
              <Typography variant="body1" sx={{ mt: 2, fontWeight: 'medium' }}>
                {isDragging ? 'Přetáhněte sem obrázek' : 'Klikněte nebo přetáhněte obrázek sem'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Podporované formáty: JPEG, PNG, GIF, WEBP (max 2MB)
              </Typography>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
              />
            </Box>
          ) : (
            // Náhled vybraného obrázku
            <Box sx={{ position: 'relative', mt: 2 }}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 1,
                  overflow: 'hidden',
                  textAlign: 'center'
                }}
              >
                <img
                  src={previewUrl}
                  alt="Náhled"
                  style={{ 
                    maxHeight: '300px', 
                    maxWidth: '100%',
                    objectFit: 'contain',
                    borderRadius: '4px'
                  }}
                />
              </Paper>
              <IconButton
                onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                sx={{ 
                  position: 'absolute', 
                  top: 8, 
                  right: 8,
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                  }
                }}
                size="small"
                aria-label="Odstranit náhled"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Zrušit
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}
            variant="contained" 
            color="primary"
            startIcon={isUploading ? <CircularProgress size={20} /> : null}
          >
            {isUploading ? 'Nahrávání...' : 'Nahrát obrázek'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MarkdownImageUpload; 