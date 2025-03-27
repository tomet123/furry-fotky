import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Notifications } from './Notifications';
import { NotificationsProvider, useNotifications } from '@/app/contexts/NotificationsContext';

// Mock pro NotificationsContext
jest.mock('@/app/contexts/NotificationsContext', () => {
  const originalModule = jest.requireActual('@/app/contexts/NotificationsContext');
  
  // Vytvoříme testovací notifikace
  const notifications = [
    { id: '1', message: 'První notifikace', type: 'info', autoHideDuration: 3000 },
    { id: '2', message: 'Úspěšná akce', type: 'success', autoHideDuration: 3000 },
    { id: '3', message: 'Chyba při ukládání', type: 'error', autoHideDuration: 3000 }
  ];
  
  // Mock pro funkci removeNotification
  const removeNotification = jest.fn();
  
  return {
    ...originalModule,
    useNotifications: jest.fn().mockReturnValue({
      notifications,
      removeNotification
    })
  };
});

describe('Notifications Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('zobrazuje notifikace ze stavu', () => {
    render(<Notifications />);
    
    // Kontrolujeme, zda jsou viditelné všechny notifikace
    expect(screen.getByText('První notifikace')).toBeInTheDocument();
    expect(screen.getByText('Úspěšná akce')).toBeInTheDocument();
    expect(screen.getByText('Chyba při ukládání')).toBeInTheDocument();
  });
  
  it('zobrazuje správné barvy podle typu notifikace', () => {
    render(<Notifications />);
    
    // Získáme kontejnery notifikací 
    const infoNotification = screen.getByText('První notifikace').closest('.MuiAlert-root');
    const successNotification = screen.getByText('Úspěšná akce').closest('.MuiAlert-root');
    const errorNotification = screen.getByText('Chyba při ukládání').closest('.MuiAlert-root');
    
    // Kontrolujeme, zda mají správné styly nebo třídy
    expect(infoNotification).toHaveClass('MuiAlert-standardInfo');
    expect(successNotification).toHaveClass('MuiAlert-standardSuccess');
    expect(errorNotification).toHaveClass('MuiAlert-standardError');
  });
  
  it('volá removeNotification při zavření notifikace', async () => {
    render(<Notifications />);
    
    // Najdeme tlačítko zavřít u první notifikace
    const closeButtons = screen.getAllByRole('button');
    const firstNotificationCloseButton = closeButtons[0];
    
    // Klikneme na tlačítko zavřít
    fireEvent.click(firstNotificationCloseButton);
    
    // Očekáváme, že removeNotification byla zavolána s ID první notifikace
    await waitFor(() => {
      expect(useNotifications().removeNotification).toHaveBeenCalledWith('1');
    });
  });
  
  it('automaticky odstraňuje notifikace po určitém čase', async () => {
    // Mockujeme setTimeout, abychom mohli testovat automatické zavírání
    jest.useFakeTimers();
    
    render(<Notifications />);
    
    // Posuneme čas o 3001ms (více než autoHideDuration první notifikace)
    jest.advanceTimersByTime(3001);
    
    // Očekáváme, že removeNotification byla zavolána pro první notifikaci
    await waitFor(() => {
      expect(useNotifications().removeNotification).toHaveBeenCalledWith('1');
    });
    
    // Vrátíme původní timery
    jest.useRealTimers();
  });
  
  // Test pro integraci s NotificationsProvider
  it('spolupracuje správně s NotificationsProvider', () => {
    // Resetujeme mock pro useNotifications, abychom mohli použít reálný provider
    (useNotifications as jest.Mock).mockRestore();
    
    // Vytvoříme testovací komponentu, která používá NotificationsContext
    const TestComponent = () => {
      const { addNotification } = useNotifications();
      
      return (
        <button onClick={() => addNotification('Testovací notifikace', 'info')}>
          Přidat notifikaci
        </button>
      );
    };
    
    // Renderujeme komponentu s providerem
    render(
      <NotificationsProvider>
        <TestComponent />
        <Notifications />
      </NotificationsProvider>
    );
    
    // Klikneme na tlačítko pro přidání notifikace
    fireEvent.click(screen.getByText('Přidat notifikaci'));
    
    // Očekáváme, že se notifikace zobrazí
    expect(screen.getByText('Testovací notifikace')).toBeInTheDocument();
  });
}); 