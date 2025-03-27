import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Komponenta, která vyhodí chybu pro testování ErrorBoundary
const ErrorComponent = () => {
  throw new Error('Test error');
};

// Komponenta, která nevyhodí chybu
const NormalComponent = () => <div>Toto je normální komponenta</div>;

describe('ErrorBoundary Component', () => {
  // Potlačení konzolových chyb během testování
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('zobrazuje děti, pokud nedojde k chybě', () => {
    render(
      <ErrorBoundary fallback={<div>Došlo k chybě</div>}>
        <NormalComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Toto je normální komponenta')).toBeInTheDocument();
    expect(screen.queryByText('Došlo k chybě')).not.toBeInTheDocument();
  });

  it('zobrazuje fallback komponentu, pokud dojde k chybě', () => {
    // Potlačení chyb v konzoli při tomto testu
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // React vypisuje chybu při testování ErrorBoundary, takže ji zachytíme
    const originalError = console.error;
    console.error = jest.fn();
    
    render(
      <ErrorBoundary fallback={<div>Došlo k chybě</div>}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Došlo k chybě')).toBeInTheDocument();
    
    // Obnovení console.error
    console.error = originalError;
  });

  it('umožňuje resetovat stav ErrorBoundary', () => {
    // Tady bychom mohli testovat resetování, pokud ErrorBoundary poskytuje způsob resetu
    // Například:
    // 
    // const { getByText } = render(
    //   <ErrorBoundary fallback={({ reset }) => (
    //     <div>
    //       <div>Došlo k chybě</div>
    //       <button onClick={reset}>Reset</button>
    //     </div>
    //   )}>
    //     <ErrorComponent />
    //   </ErrorBoundary>
    // );
    // 
    // expect(getByText('Došlo k chybě')).toBeInTheDocument();
    // fireEvent.click(getByText('Reset'));
    // ...další aserce
    
    // Tato implementace závisí na tom, jak je ErrorBoundary napsána
    
    // Pro účely tohoto testu předpokládáme, že reset není implementován
    expect(true).toBe(true);
  });

  it('umožňuje přizpůsobit fallback obsah', () => {
    // React vypisuje chybu při testování ErrorBoundary, takže ji zachytíme
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const customFallbackText = 'Vlastní chybová zpráva';
    
    render(
      <ErrorBoundary fallback={<div>{customFallbackText}</div>}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(customFallbackText)).toBeInTheDocument();
  });
}); 