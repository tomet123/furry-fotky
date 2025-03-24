'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';

interface MarkdownHelpProps {
  buttonLabel?: string;
  iconOnly?: boolean;
}

export default function MarkdownHelp({ buttonLabel = 'Nápověda k Markdown', iconOnly = false }: MarkdownHelpProps) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Definice příkladů Markdown syntaxe
  const examples = [
    { 
      syntax: '# Nadpis 1\n## Nadpis 2\n### Nadpis 3', 
      description: 'Nadpisy různých úrovní' 
    },
    { 
      syntax: '**Tučný text**\n*Kurzíva*\n~~Přeškrtnutý text~~', 
      description: 'Formátování textu' 
    },
    { 
      syntax: '- Položka seznamu\n- Další položka\n  - Vnořená položka', 
      description: 'Odrážkový seznam' 
    },
    { 
      syntax: '1. První položka\n2. Druhá položka\n3. Třetí položka', 
      description: 'Číslovaný seznam' 
    },
    { 
      syntax: '[Text odkazu](https://example.com)', 
      description: 'Odkaz' 
    },
    { 
      syntax: '![Popisek obrázku](cesta/k/obrazku.jpg)', 
      description: 'Obrázek' 
    },
    { 
      syntax: '> Toto je citace textu.', 
      description: 'Citace' 
    },
    { 
      syntax: '```\nfunction hello() {\n  console.log("Hello");\n}\n```', 
      description: 'Blok kódu' 
    },
    { 
      syntax: '| Sloupec 1 | Sloupec 2 |\n| -------- | -------- |\n| Buňka 1  | Buňka 2  |', 
      description: 'Tabulka' 
    },
    { 
      syntax: '---', 
      description: 'Horizontální čára' 
    }
  ];

  return (
    <>
      {iconOnly ? (
        <IconButton
          onClick={handleOpen}
          aria-label="Nápověda k Markdown"
          color="primary"
          size="small"
          sx={{ ml: 1 }}
        >
          <InfoIcon />
        </IconButton>
      ) : (
        <Button 
          startIcon={<InfoIcon />} 
          onClick={handleOpen} 
          size="small" 
          color="primary"
          variant="outlined"
          sx={{ mb: 2 }}
        >
          {buttonLabel}
        </Button>
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        fullScreen={fullScreen}
      >
        <DialogTitle sx={{ pr: 6 }}>
          Nápověda k Markdown formátování
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
        <DialogContent dividers>
          <Typography paragraph>
            Markdown je jednoduchý značkovací jazyk, který vám umožňuje formátovat text. Zde jsou základní příklady, jak Markdown používat:
          </Typography>
          
          <Grid container spacing={2}>
            {examples.map((example, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Paper 
                  elevation={2}
                  sx={{
                    p: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    {example.description}
                  </Typography>
                  <Box
                    sx={{
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                      p: 2,
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.9rem',
                      mb: 1,
                      flexGrow: 1
                    }}
                  >
                    {example.syntax}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
          
          <Typography sx={{ mt: 3 }} variant="body2" color="text.secondary">
            Tip: Ve výsledném textu se Markdown syntaxe převede na formátovaný text. Některé pokročilé syntaxe nemusí být podporovány.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Zavřít</Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 