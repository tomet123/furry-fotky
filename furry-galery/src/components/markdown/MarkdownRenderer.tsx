'use client';

import React from 'react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { Box, useTheme } from '@mui/material';

// Načtení stylů pro Markdown preview
import '@uiw/react-markdown-preview/markdown.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Komponenta pro zobrazení Markdown obsahu ve stejném stylu jako náhled v editoru
 * Používá @uiw/react-markdown-preview, což je stejná knihovna, kterou používá editor
 */
export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const theme = useTheme();
  const colorMode = theme.palette.mode;

  // Zajišťujeme konzistentní styly s editorem
  const customStyles = `
    .wmde-markdown {
      background-color: transparent !important;
      font-family: ${theme.typography.fontFamily} !important;
      color: ${theme.palette.text.primary} !important;
      line-height: 1.6 !important;
    }
    
    .wmde-markdown h1, 
    .wmde-markdown h2, 
    .wmde-markdown h3, 
    .wmde-markdown h4, 
    .wmde-markdown h5, 
    .wmde-markdown h6 {
      color: ${theme.palette.text.primary} !important;
      border-bottom: 1px solid ${theme.palette.divider} !important;
      font-weight: 500 !important;
      margin-bottom: 16px !important;
      margin-top: 24px !important;
    }
    
    .wmde-markdown p {
      margin-bottom: 16px !important;
      margin-top: 0 !important;
    }
    
    .wmde-markdown pre {
      background-color: ${theme.palette.background.paper} !important;
      border: 1px solid ${theme.palette.divider} !important;
    }
    
    .wmde-markdown code {
      background-color: ${theme.palette.action.hover} !important;
      color: ${theme.palette.text.primary} !important;
      border-radius: 3px !important;
      padding: 0.2em 0.4em !important;
    }
    
    .wmde-markdown blockquote {
      border-left: 4px solid ${theme.palette.primary.main} !important;
      color: ${theme.palette.text.secondary} !important;
      padding-left: 16px !important;
      margin-left: 0 !important;
    }
    
    .wmde-markdown a {
      color: ${theme.palette.primary.main} !important;
      text-decoration: none !important;
    }
    
    .wmde-markdown a:hover {
      text-decoration: underline !important;
    }
    
    .wmde-markdown img {
      max-width: 100% !important;
      border-radius: 4px !important;
      margin: 16px 0 !important;
    }
    
    .wmde-markdown table {
      border-collapse: collapse !important;
      width: 100% !important;
      margin: 16px 0 !important;
    }
    
    .wmde-markdown th, .wmde-markdown td {
      border: 1px solid ${theme.palette.divider} !important;
      padding: 8px 12px !important;
    }
    
    .wmde-markdown th {
      background-color: ${theme.palette.action.hover} !important;
    }
    
    .wmde-markdown ul, .wmde-markdown ol {
      padding-left: 24px !important;
      margin-bottom: 16px !important;
    }
    
    .wmde-markdown hr {
      height: 1px !important;
      background-color: ${theme.palette.divider} !important;
      border: none !important;
      margin: 24px 0 !important;
    }
  `;

  return (
    <Box className={className}>
      <style jsx global>{customStyles}</style>
      <div data-color-mode={colorMode}>
        <MarkdownPreview 
          source={content || ''}
          rehypeRewrite={(node) => {
            // Přidáváme atribut target="_blank" a rel="noopener noreferrer" ke všem odkazům
            if (node.type === 'element' && node.tagName === 'a') {
              if (node.properties && node.properties.href) {
                const href = node.properties.href;
                if (typeof href === 'string' && href.startsWith('http')) {
                  node.properties.target = '_blank';
                  node.properties.rel = 'noopener noreferrer';
                }
              }
            }
          }}
        />
      </div>
    </Box>
  );
} 