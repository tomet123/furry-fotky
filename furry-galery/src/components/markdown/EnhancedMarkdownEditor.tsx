'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MDEditor, { commands } from '@uiw/react-md-editor';
import { Box, Typography, useTheme } from '@mui/material';
import MarkdownHelp from './MarkdownHelp';
import PhotoIcon from '@mui/icons-material/Photo';
import { SnackbarProvider } from 'notistack';
import MarkdownImageUpload from './MarkdownImageUpload';

// Načtení originálních stylů z knihovny
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

interface EnhancedMarkdownEditorProps {
  value: string;
  onChange: (value?: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  maxLength?: number;
}

export default function EnhancedMarkdownEditor({
  value,
  onChange,
  placeholder = 'Napište text pomocí Markdown formátování...',
  height = 300,
  disabled = false,
  label,
  helperText,
  maxLength
}: EnhancedMarkdownEditorProps) {
  const theme = useTheme();
  const colorMode = theme.palette.mode;
  const [charCount, setCharCount] = useState(0);

  // Počítání znaků
  useEffect(() => {
    setCharCount(value?.length || 0);
  }, [value]);

  // Funkce pro vložení obrázku do Markdown
  const handleImageUpload = (imageUrl: string) => {
    const imageMarkdown = `![Obrázek](${imageUrl})`;
    const newValue = value 
      ? `${value}\n\n${imageMarkdown}`
      : imageMarkdown;
    onChange(newValue);
  };

  // Handler pro změnu textu s omezením maximální délky
  const handleChange = useCallback((value?: string) => {
    if (maxLength && value && value.length > maxLength) {
      value = value.substring(0, maxLength);
    }
    onChange(value);
  }, [onChange, maxLength]);

  // Vlastní příkaz pro nahrávání obrázků
  const uploadImageCommand = {
    name: 'image-upload',
    keyCommand: 'image-upload',
    buttonProps: { 'aria-label': 'Nahrát obrázek' },
    icon: <PhotoIcon style={{ fontSize: '22px', display: 'block' }} />,
    execute: () => {},
    render: (command: any, disabled: boolean, executeCommand: (command: any, name: string) => void) => (
      <MarkdownImageUpload onImageUploaded={handleImageUpload} />
    ),
  };

  // Používáme pouze příkazy, které jsou definované v knihovně
  const mergedCommands = [
    commands.bold,
    commands.italic, 
    commands.strikethrough,
    commands.hr,
    commands.divider,
    commands.link,
    commands.quote,
    commands.code,
    commands.divider,
    commands.codeBlock,
    commands.divider,
    uploadImageCommand
  ];

  // Vlastní CSS pro zvětšení ikon a zlepšení barevného schématu
  const customStyles = `
    .w-md-editor-toolbar {
      padding: 8px !important;
    }
    
    .w-md-editor-toolbar > ul > li > button {
      padding: 6px !important;
      margin: 0 3px !important;
      border-radius: 4px !important;
      height: 36px !important;
      width: 36px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      position: relative !important;
    }
    
    /* Oprava zvýraznění při najetí kurzorem */
    .w-md-editor-toolbar > ul > li > button:hover {
      background-color: ${theme.palette.action.hover} !important;
    }
    
    .w-md-editor-toolbar svg {
      width: 22px !important;
      height: 22px !important;
      display: block !important;
      margin: auto !important;
    }
    
    .w-md-editor-toolbar button {
      color: ${theme.palette.text.primary} !important;
    }
    
    /* Oprava zobrazení MUI komponent uvnitř toolbaru */
    .w-md-editor-toolbar li button > * {
      position: absolute !important;
      left: 50% !important;
      top: 50% !important;
      transform: translate(-50%, -50%) !important;
    }
    
    /* Oprava MUI Ikonek */
    .w-md-editor-toolbar .MuiSvgIcon-root {
      font-size: 22px !important;
    }
    
    /* Oprava MUI tlačítek */
    .w-md-editor-toolbar .MuiIconButton-root {
      width: 36px !important;
      height: 36px !important;
      padding: 6px !important;
    }
    
    .w-md-editor-content {
      color: ${theme.palette.text.primary} !important;
      background-color: ${theme.palette.background.paper} !important;
    }
    
    .w-md-editor {
      color: ${theme.palette.text.primary} !important;
      background-color: ${theme.palette.background.paper} !important;
      border-color: ${theme.palette.divider} !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
    }
    
    .w-md-editor:focus-within {
      border-color: ${theme.palette.primary.main} !important;
      box-shadow: 0 0 0 3px ${theme.palette.primary.main}30 !important;
    }
    
    .w-md-editor-text {
      padding: 16px !important;
    }
    
    .wmde-markdown {
      background-color: ${theme.palette.background.paper} !important;
    }
    
    .w-md-editor-toolbar-divider {
      margin: 0 5px !important;
      height: 24px !important;
    }
  `;

  return (
    <SnackbarProvider maxSnack={3}>
      <style jsx global>{customStyles}</style>
      <Box sx={{ mb: 2 }}>
        {label && (
          <Typography variant="h6" sx={{ mb: 1 }}>
            {label}
          </Typography>
        )}
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 1 
        }}>
          {helperText && (
            <Typography variant="body2" color="text.secondary">
              {helperText}
            </Typography>
          )}
          <MarkdownHelp iconOnly />
        </Box>
        
        <div data-color-mode={colorMode}>
          <MDEditor
            value={value}
            onChange={handleChange}
            preview="edit"
            height={height}
            commands={mergedCommands}
            textareaProps={{
              placeholder,
              disabled
            }}
          />
        </div>
        
        {maxLength && (
          <Typography 
            variant="caption" 
            color={charCount > maxLength ? "error" : "text.secondary"} 
            sx={{ mt: 1, display: 'block', textAlign: 'right' }}
          >
            {charCount}/{maxLength} znaků
          </Typography>
        )}
      </Box>
    </SnackbarProvider>
  );
}