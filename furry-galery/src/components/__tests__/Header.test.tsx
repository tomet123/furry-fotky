import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../Header';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

// Mock Material-UI hooks a komponenty
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    useMediaQuery: jest.fn().mockReturnValue(false),
    useTheme: jest.fn().mockReturnValue({
      breakpoints: {
        down: jest.fn().mockReturnValue('@media (max-width: 600px)'),
      },
    }),
    // Mock komponenty
    AppBar: ({ children, ...props }: any) => <div data-testid="app-bar" {...props}>{children}</div>,
    Toolbar: ({ children, ...props }: any) => <div data-testid="toolbar" {...props}>{children}</div>,
    Typography: ({ children, ...props }: any) => <span data-testid="typography" {...props}>{children}</span>,
    Button: ({ children, ...props }: any) => <button data-testid="button" {...props}>{children}</button>,
    IconButton: ({ children, ...props }: any) => <button data-testid="icon-button" {...props}>{children}</button>,
    Avatar: (props: any) => <div data-testid="avatar" {...props} />,
    Menu: ({ children, ...props }: any) => <div data-testid="menu" {...props}>{children}</div>,
    MenuItem: ({ children, ...props }: any) => <div data-testid="menu-item" {...props}>{children}</div>,
    Box: ({ children, ...props }: any) => <div data-testid="box" {...props}>{children}</div>,
    Container: ({ children, ...props }: any) => <div data-testid="container" {...props}>{children}</div>,
    Tabs: ({ children, ...props }: any) => <div data-testid="tabs" {...props}>{children}</div>,
    Tab: ({ label, ...props }: any) => <div data-testid="tab" aria-selected={props['aria-selected'] || false} {...props}>{label}</div>,
    Stack: ({ children, ...props }: any) => <div data-testid="stack" {...props}>{children}</div>,
    Drawer: ({ children, ...props }: any) => <div data-testid="drawer" {...props}>{children}</div>,
    List: ({ children, ...props }: any) => <div data-testid="list" {...props}>{children}</div>,
    Divider: () => <hr data-testid="divider" />,
  };
});

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...rest }: any) => (
    <a href={href} {...rest}>{children}</a>
  );
});

// Mock ikony
jest.mock('@mui/icons-material/Person', () => () => <div data-testid="person-icon" />);
jest.mock('@mui/icons-material/Menu', () => () => <div data-testid="menu-icon" />);
jest.mock('@mui/icons-material/PhotoLibrary', () => () => <div data-testid="photo-library-icon" />);
jest.mock('@mui/icons-material/Event', () => () => <div data-testid="event-icon" />);
jest.mock('@mui/icons-material/People', () => () => <div data-testid="people-icon" />);

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Výchozí mock implementace
    (usePathname as jest.Mock).mockReturnValue('/');
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
  });

  it('zobrazuje správně logo', () => {
    render(<Header />);
    
    // Logo - použijeme testId místo textu
    const logoElements = screen.getAllByTestId('typography');
    const logo = logoElements.find(el => el.textContent === 'FurryFotky.cz');
    expect(logo).toBeInTheDocument();
  });

  it('zobrazuje tlačítka pro přihlášení pro nepřihlášeného uživatele', () => {
    render(<Header />);
    
    // Tlačítka pro přihlášení a registraci
    expect(screen.getByText('Přihlášení')).toBeInTheDocument();
    expect(screen.getByText('Registrace')).toBeInTheDocument();
  });

  it('zobrazuje uživatelské jméno pro přihlášeného uživatele', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          username: 'testuser',
          email: 'test@example.com',
        },
      },
      status: 'authenticated',
    });

    render(<Header />);
    
    // Najdeme uživatelské jméno pomocí testId a ověříme obsah
    const userElements = screen.getAllByTestId('typography');
    const username = userElements.find(el => el.textContent === 'testuser');
    expect(username).toBeInTheDocument();
  });

  it('zobrazí správný text v menu pro přihlášeného uživatele', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          username: 'testuser',
          email: 'test@example.com',
        },
      },
      status: 'authenticated',
    });

    render(<Header />);
    
    // Ověříme, že jsou v komponentě texty pro menu
    expect(screen.getByText('Přihlášen jako:')).toBeInTheDocument();
    expect(screen.getByText('Můj profil')).toBeInTheDocument();
    expect(screen.getByText('Odhlásit se')).toBeInTheDocument();
  });

  it('zavolá signOut po kliknutí na odhlásit', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          username: 'testuser',
          email: 'test@example.com',
        },
      },
      status: 'authenticated',
    });

    render(<Header />);
    
    // Ověříme, že existuje odkaz/tlačítko pro odhlášení
    const logoutLink = screen.getByText('Odhlásit se');
    expect(logoutLink).toBeInTheDocument();
    
    // Klikneme přímo na odkaz
    logoutLink.click();
    
    // Ověříme, že signOut byl zavolán
    expect(signOut).toHaveBeenCalledWith({ redirect: false });
  });
}); 