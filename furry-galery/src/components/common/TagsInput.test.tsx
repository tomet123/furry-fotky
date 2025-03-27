import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TagsInput } from './TagsInput';

describe('TagsInput Component', () => {
  const mockOnChange = jest.fn();
  const mockTags = ['furry', 'fluffy', 'cute'];
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('zobrazuje správně seznam tagů', () => {
    render(
      <TagsInput 
        value={mockTags} 
        onChange={mockOnChange} 
        placeholder="Přidat tag"
      />
    );
    
    // Ověříme, že se zobrazují všechny tagy
    mockTags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
    
    // Ověříme, že se zobrazuje inputbox s placeholderem
    const input = screen.getByPlaceholderText('Přidat tag');
    expect(input).toBeInTheDocument();
  });
  
  it('umožňuje přidat nový tag', async () => {
    render(
      <TagsInput 
        value={mockTags} 
        onChange={mockOnChange} 
        placeholder="Přidat tag"
      />
    );
    
    // Najdeme inputbox
    const input = screen.getByPlaceholderText('Přidat tag');
    
    // Zadáme nový tag
    fireEvent.change(input, { target: { value: 'new-tag' } });
    
    // Stiskneme Enter pro potvrzení
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    // Ověříme, že byl onChange zavolán s aktualizovaným polem tagů
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith([...mockTags, 'new-tag']);
    });
  });
  
  it('ignoruje prázdné tagy', () => {
    render(
      <TagsInput 
        value={mockTags} 
        onChange={mockOnChange} 
        placeholder="Přidat tag"
      />
    );
    
    // Najdeme inputbox
    const input = screen.getByPlaceholderText('Přidat tag');
    
    // Pokusíme se zadat prázdný tag
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    // Ověříme, že onChange nebyl zavolán
    expect(mockOnChange).not.toHaveBeenCalled();
  });
  
  it('ignoruje duplicitní tagy', () => {
    render(
      <TagsInput 
        value={mockTags} 
        onChange={mockOnChange} 
        placeholder="Přidat tag"
      />
    );
    
    // Najdeme inputbox
    const input = screen.getByPlaceholderText('Přidat tag');
    
    // Pokusíme se zadat duplicitní tag
    fireEvent.change(input, { target: { value: 'furry' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    // Ověříme, že onChange nebyl zavolán
    expect(mockOnChange).not.toHaveBeenCalled();
  });
  
  it('umožňuje odstranit tag', async () => {
    render(
      <TagsInput 
        value={mockTags} 
        onChange={mockOnChange} 
        placeholder="Přidat tag"
      />
    );
    
    // Najdeme první tag a jeho tlačítko pro odstranění
    const tagToRemove = mockTags[0];
    const tagElement = screen.getByText(tagToRemove);
    const deleteButton = tagElement.nextSibling; // tlačítko pro odstranění je následujícím sourozencem
    
    // Klikneme na tlačítko pro odstranění
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }
    
    // Ověříme, že byl onChange zavolán s aktualizovaným polem tagů
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(mockTags.slice(1));
    });
  });
  
  it('akceptuje tagy při přidání čárky', async () => {
    render(
      <TagsInput 
        value={mockTags} 
        onChange={mockOnChange} 
        placeholder="Přidat tag"
      />
    );
    
    // Najdeme inputbox
    const input = screen.getByPlaceholderText('Přidat tag');
    
    // Zadáme nový tag s čárkou na konci
    fireEvent.change(input, { target: { value: 'new-tag,' } });
    
    // Ověříme, že byl onChange zavolán s aktualizovaným polem tagů
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith([...mockTags, 'new-tag']);
    });
    
    // Ověříme, že input je vyčištěn
    expect(input).toHaveValue('');
  });
  
  it('správně zpracovává vlastnost disabled', () => {
    render(
      <TagsInput 
        value={mockTags} 
        onChange={mockOnChange} 
        placeholder="Přidat tag"
        disabled
      />
    );
    
    // Najdeme inputbox a ověříme, že je disabled
    const input = screen.getByPlaceholderText('Přidat tag');
    expect(input).toBeDisabled();
    
    // Pokusíme se zadat nový tag
    fireEvent.change(input, { target: { value: 'new-tag' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    // Ověříme, že onChange nebyl zavolán
    expect(mockOnChange).not.toHaveBeenCalled();
  });
}); 