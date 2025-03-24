/**
 * Typy pro Markdown editor
 */

/**
 * Props pro MarkdownEditor komponentu
 */
export interface MarkdownEditorProps {
  /** Hodnota editoru */
  value: string;
  /** Callback pro změnu hodnoty */
  onChange?: (value: string) => void;
  /** Minimální počet řádků (ovlivňuje min. výšku) */
  minRows?: number;
  /** Placeholder text */
  placeholder?: string;
  /** Text nápovědy pod editorem */
  helperText?: string;
  /** Chybový stav */
  error?: boolean;
  /** Zablokování editoru */
  disabled?: boolean;
  /** ID elementu pro label */
  id?: string;
}

/**
 * Props pro MarkdownRenderer komponentu
 */
export interface MarkdownRendererProps {
  /** Markdown obsah k renderování */
  content: string;
  /** Maximální délka textu při oříznutí */
  truncate?: number;
  /** Stav načítání */
  loading?: boolean;
} 