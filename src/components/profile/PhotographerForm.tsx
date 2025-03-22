'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  Switch,
  FormControlLabel,
  InputAdornment
} from '@mui/material';
import { useAuthContext } from '@/components/context/AuthContext';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { useTheme } from '@mui/material/styles';
import onImagePasted from '@/lib/onImagePasted';
import UploadImageButton from '@/components/UploadImageButton';
import { authorizedFetch } from '@/lib/api';

// Dynamický import pro vyřešení problémů s SSR
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

// Přidání globálních stylů pro MD Editor
// Toto se aplikuje po celé aplikaci
const mdEditorStyles = `
.w-md-editor {
  background-color: #1a1a1a !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
  color: rgba(255, 255, 255, 0.87) !important;
}

.w-md-editor-toolbar {
  background-color: #242424 !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
  padding: 4px 2px !important;
  min-height: 40px !important;
}

.w-md-editor-toolbar ul {
  display: flex !important;
  align-items: center !important;
  height: 100% !important;
}

.w-md-editor-toolbar ul li {
  display: flex !important;
  align-items: center !important;
  margin: 0 1px !important;
}

.w-md-editor-toolbar ul li button {
  color: rgba(255, 255, 255, 0.7) !important;
  font-size: 16px !important;
  padding: 4px !important;
  line-height: 1 !important;
  height: 32px !important;
  width: 32px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.w-md-editor-toolbar ul li button svg {
  transform: scale(1.2) !important;
}

.w-md-editor-toolbar ul li button:hover {
  color: #90caf9 !important;
  background-color: rgba(144, 202, 249, 0.08) !important;
}

.w-md-editor-toolbar ul li button.active {
  color: #90caf9 !important;
  background-color: rgba(144, 202, 249, 0.16) !important;
}

.w-md-editor-text {
  color: rgba(255, 255, 255, 0.87) !important;
  background-color: #1a1a1a !important;
}

.w-md-editor-text-pre, .w-md-editor-text-input {
  color: rgba(255, 255, 255, 0.87) !important;
}

.w-md-editor-preview {
  background-color: #242424 !important;
  box-shadow: inset 1px 0 0 0 rgba(255, 255, 255, 0.12) !important;
}

.wmde-markdown {
  background-color: #242424 !important;
  color: rgba(255, 255, 255, 0.87) !important;
}

.wmde-markdown pre {
  background-color: #303030 !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
}

.wmde-markdown code {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #f48fb1 !important;
}

.wmde-markdown blockquote {
  border-left-color: rgba(255, 255, 255, 0.12) !important;
  color: rgba(255, 255, 255, 0.6) !important;
  background-color: rgba(255, 255, 255, 0.05) !important;
}

.wmde-markdown h1, .wmde-markdown h2, .wmde-markdown h3, 
.wmde-markdown h4, .wmde-markdown h5, .wmde-markdown h6 {
  color: rgba(255, 255, 255, 0.87) !important;
  border-bottom-color: rgba(255, 255, 255, 0.12) !important;
}

.wmde-markdown hr {
  background-color: rgba(255, 255, 255, 0.12) !important;
}

.wmde-markdown table tr {
  border-top-color: rgba(255, 255, 255, 0.12) !important;
  background-color: #242424 !important;
}

.wmde-markdown table tr:nth-child(2n) {
  background-color: #303030 !important;
}

.wmde-markdown table td, .wmde-markdown table th {
  border-color: rgba(255, 255, 255, 0.12) !important;
}
`;

// Vlastní styly pro editor
const editorStyles = {
  wrapper: {
    borderRadius: '4px',
    overflow: 'hidden',
  },
  editor: {
    backgroundColor: '#1a1a1a',
    border: '1px solid rgba(255, 255, 255, 0.12)'
  },
  preview: {
    backgroundColor: '#242424',
    color: 'rgba(255, 255, 255, 0.87)'
  }
};

interface PhotographerFormData {
  name: string;
  shortBio: string;
  profile: string;
}

export default function PhotographerForm() {
  const { user, refreshUser } = useAuthContext();
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Formulářová data
  const [formData, setFormData] = useState<PhotographerFormData>({
    name: '',
    shortBio: '',
    profile: '',
  });

  // Získání existujících dat fotografa, pokud jsou k dispozici
  const fetchPhotographerData = useCallback(async () => {
    if (user?.photographer_id) {
      try {
        const response = await authorizedFetch(`/api/photographers/${user.photographer_id}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setFormData({
              name: data.data.name || '',
              shortBio: data.data.bio || '',
              profile: data.data.profile || '',
            });
          }
        }
      } catch (err) {
        console.error('Error fetching photographer data:', err);
      }
    }
  }, [user?.photographer_id]);

  // Načtení dat při prvním renderování
  useEffect(() => {
    fetchPhotographerData();
  }, [fetchPhotographerData]);

  // Přidání stylů do dokumentu
  useEffect(() => {
    // Přidání stylů pro MD Editor
    const styleElementId = 'md-editor-styles';
    
    // Kontrolujeme, zda už styl neexistuje
    let styleElement = document.getElementById(styleElementId) as HTMLStyleElement;
    
    if (!styleElement) {
      // Pokud neexistuje, vytvoříme nový
      styleElement = document.createElement('style');
      styleElement.id = styleElementId;
      styleElement.innerHTML = mdEditorStyles;
      document.head.appendChild(styleElement);
    } else {
      // Pokud už existuje, jen aktualizujeme obsah
      styleElement.innerHTML = mdEditorStyles;
    }
    
    // Cleanup při odmontování komponenty
    return () => {
      // Bezpečnější způsob odstraňování - nejprve zkontrolujeme, zda prvek stále existuje v DOM
      const element = document.getElementById(styleElementId);
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, []);

  // Změna formulářových dat pro textová pole
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Změna Markdown v editoru
  const handleProfileChange = useCallback((value: string | undefined) => {
    setFormData(prev => ({
      ...prev,
      profile: value || ''
    }));
  }, []);

  // Funkce pro zpracování nahrání obrázku z tlačítka
  const handleImageUpload = async (file: File) => {
    try {
      // Vytvoření FormData pro nahrání souboru
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      
      // Nahrání obrázku na server s autorizací
      const response = await authorizedFetch('/api/upload/profileImage', {
        method: 'POST',
        body: uploadFormData,
        // Pro FormData nenastavujeme 'Content-Type'
        headers: {}
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Pokud bylo nahrání úspěšné, vložíme markdown s URL obrázku
        const imageMarkdown = `![${file.name}](${result.imageUrl})`;
        
        // Aktualizace hodnoty v editoru přidáním markdownu s obrázkem
        const updatedProfileValue = formData.profile 
          ? `${formData.profile}\n\n${imageMarkdown}`
          : imageMarkdown;
        
        // Aktualizace stavu
        handleProfileChange(updatedProfileValue);
      } else {
        console.error('Chyba při nahrávání obrázku:', result.message);
        alert(`Chyba při nahrávání obrázku: ${result.message}`);
      }
    } catch (error) {
      console.error('Chyba při zpracování obrázku:', error);
      alert('Při nahrávání obrázku došlo k chybě. Zkuste to prosím znovu.');
    }
  };

  // Odeslání formuláře
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Prosím vyplňte jméno fotografa.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Určení správné URL a metody pro API požadavek
      const apiUrl = user?.photographer_id 
        ? `/api/photographers/${user.photographer_id}` 
        : `/api/photographers`;
      const method = user?.photographer_id ? 'PUT' : 'POST';
      
      // Odeslání požadavku s upravenými daty
      const requestData = {
        name: formData.name,
        bio: formData.shortBio,
        profile: formData.profile,
      };
      
      // Odeslání požadavku s autorizací
      const response = await authorizedFetch(apiUrl, {
        method,
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Při ukládání profilu fotografa došlo k chybě.');
      }
      
      const responseData = await response.json();
      
      if (responseData.success) {
        // Aktualizace informací o uživateli
        await refreshUser();
        setSuccess(true);
      } else {
        throw new Error('Při ukládání profilu fotografa došlo k chybě.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Při ukládání profilu fotografa došlo k chybě.');
      console.error('Error saving photographer profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, user?.photographer_id, refreshUser]);

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(false);
  };

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {user?.photographer_id ? 'Upravit profil fotografa' : 'Vytvořit profil fotografa'}
      </Typography>
      
      {!user?.photographer_id && (
        <Typography variant="body2" color="text.secondary" paragraph>
          Jako začínající fotograf budete moci sdílet své fotografie a získávat zpětnou vazbu od komunity.
        </Typography>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="name"
          label="Jméno fotografa"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        
        <TextField
          margin="normal"
          fullWidth
          id="shortBio"
          label="O mě"
          name="shortBio"
          value={formData.shortBio}
          onChange={handleChange}
          disabled={isSubmitting}
          inputProps={{ maxLength: 64 }}
          helperText={`${formData.shortBio.length}/64 znaků - krátký popis pro přehled fotografů`}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {formData.shortBio.length}/64
              </InputAdornment>
            ),
          }}
        />
        
        <Box mt={3} mb={2}>
          <Typography variant="subtitle1" gutterBottom>
            Profil
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Detailní popis s možností formátování textu pomocí Markdown syntaxe. Obrázky můžete přetáhnout přímo do editoru nebo vložit ze schránky.
          </Typography>
          
          <Box mb={1}>
            <UploadImageButton onImageUpload={handleImageUpload} />
            <Typography variant="caption" display="inline" color="text.secondary">
              Nahrajte obrázek a vložte ho do profilu
            </Typography>
          </Box>
          
          <div data-color-mode="dark" style={editorStyles.wrapper}>
            <MDEditor
              value={formData.profile}
              onChange={handleProfileChange}
              preview="edit"
              height={300}
              textareaProps={{
                placeholder: 'Napište zde svůj detailní profil s podporou Markdown formátování. Obrázky můžete přetáhnout přímo do editoru nebo vložit ze schránky.',
              }}
              onPaste={async (event) => {
                await onImagePasted(event.clipboardData, handleProfileChange);
              }}
              onDrop={async (event) => {
                event.preventDefault();
                await onImagePasted(event.dataTransfer, handleProfileChange);
              }}
              style={editorStyles.editor}
              previewOptions={{
                style: editorStyles.preview
              }}
            />
          </div>
        </Box>
        
        <FormControlLabel
          control={
            <Switch 
              checked={true} 
              disabled={true}
            />
          }
          label="Začínající fotograf"
          sx={{ mt: 2, opacity: 0.8 }}
        />
        
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 2 }}>
          Všichni noví fotografové začínají jako začátečníci. Status lze později změnit.
        </Typography>
        
        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isSubmitting 
            ? 'Ukládání...' 
            : user?.photographer_id 
              ? 'Uložit změny' 
              : 'Vytvořit profil fotografa'
          }
        </Button>
      </Box>
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar open={success} autoHideDuration={6000} onClose={handleCloseSuccess}>
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          {user?.photographer_id 
            ? 'Profil fotografa byl úspěšně aktualizován.' 
            : 'Profil fotografa byl úspěšně vytvořen.'
          }
        </Alert>
      </Snackbar>
    </Paper>
  );
} 