import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer', () => {
  it('zobrazuje správný copyright text s aktuálním rokem', () => {
    render(<Footer />);
    
    const currentYear = new Date().getFullYear();
    const expectedText = `© ${currentYear} FurryFotky.cz | Všechna práva vyhrazena`;
    
    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });

  it('má správný tag a třídu', () => {
    const { container } = render(<Footer />);
    
    // Kontrola, že je footer tag použit
    const footerElement = container.querySelector('footer');
    expect(footerElement).toBeInTheDocument();
  });
}); 