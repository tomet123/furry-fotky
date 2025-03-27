import React, { useState, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { Box, TextField, Chip, Stack, Typography } from '@mui/material';

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  maxTags?: number;
  color?: 'primary' | 'secondary' | 'default' | 'error' | 'info' | 'success' | 'warning';
}

export const TagsInput: React.FC<TagsInputProps> = ({
  value = [],
  onChange,
  label,
  placeholder = 'Přidat tag',
  helperText,
  error = false,
  disabled = false,
  maxTags = 10,
  color = 'primary'
}) => {
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<string[]>(value || []);
  
  // Synchronizace s externím stavem
  useEffect(() => {
    setTags(value || []);
  }, [value]);
  
  // Přidání nového tagu
  const addTag = (tag: string) => {
    // Ignorujeme prázdné tagy
    if (!tag.trim()) return;
    
    // Konvertujeme na malá písmena a odstraníme mezery na koncích
    const normalizedTag = tag.trim().toLowerCase();
    
    // Ignorujeme duplicitní tagy
    if (tags.includes(normalizedTag)) return;
    
    // Ignorujeme, pokud jsme dosáhli maximálního počtu tagů
    if (tags.length >= maxTags) return;
    
    // Vytvoříme nové pole s přidaným tagem
    const newTags = [...tags, normalizedTag];
    setTags(newTags);
    onChange(newTags);
    
    // Vyčistíme vstupní pole
    setInputValue('');
  };
  
  // Odstranění tagu
  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
    onChange(newTags);
  };
  
  // Handler pro změnu hodnoty inputu
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Pokud je hodnota zakončena čárkou, přidáme tag
    if (value.endsWith(',')) {
      const tag = value.slice(0, -1).trim();
      addTag(tag);
    } else {
      setInputValue(value);
    }
  };
  
  // Handler pro stisk klávesy
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Odstraníme poslední tag, pokud je vstupní pole prázdné a uživatel stiskne backspace
      removeTag(tags.length - 1);
    }
  };
  
  return (
    <Box>
      {label && <Typography variant="subtitle2" gutterBottom>{label}</Typography>}
      
      <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" sx={{ mb: 1 }}>
        {tags.map((tag, index) => (
          <Chip
            key={index}
            label={tag}
            color={color}
            onDelete={disabled ? undefined : () => removeTag(index)}
            sx={{ m: 0.5 }}
            disabled={disabled}
          />
        ))}
        
        <TextField
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          variant="outlined"
          size="small"
          disabled={disabled || tags.length >= maxTags}
          helperText={helperText}
          error={error}
          sx={{
            flexGrow: 1,
            m: 0.5
          }}
          inputProps={{
            'aria-label': label || 'Přidat tag'
          }}
        />
      </Stack>
      
      {maxTags && (
        <Typography variant="caption" color="text.secondary">
          {`${tags.length}/${maxTags} tagů`}
        </Typography>
      )}
    </Box>
  );
}; 