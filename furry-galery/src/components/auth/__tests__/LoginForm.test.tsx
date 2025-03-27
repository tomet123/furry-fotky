import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../LoginForm';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('LoginForm', () => {
  // Setup před každým testem
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
      refresh: jest.fn(),
    });
  });

  it('renderuje formulář s poli pro uživatelské jméno a heslo', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/uživatelské jméno/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/heslo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /přihlásit/i })).toBeInTheDocument();
  });

  it('zobrazí chybu při odeslání prázdného formuláře', async () => {
    render(<LoginForm />);
    
    const submitButton = screen.getByRole('button', { name: /přihlásit/i });
    const user = userEvent.setup();
    await user.click(submitButton);
    
    expect(screen.getByText(/vyplňte prosím uživatelské jméno a heslo/i)).toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();
  });

  it('zavolá signIn s credentials při správném vyplnění formuláře', async () => {
    render(<LoginForm />);
    
    const usernameInput = screen.getByLabelText(/uživatelské jméno/i);
    const passwordInput = screen.getByLabelText(/heslo/i);
    const submitButton = screen.getByRole('button', { name: /přihlásit/i });
    
    const user = userEvent.setup();
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    
    (signIn as jest.Mock).mockResolvedValueOnce({ error: null });
    
    await user.click(submitButton);
    
    expect(signIn).toHaveBeenCalledWith('credentials', {
      username: 'testuser',
      password: 'password123',
      redirect: false,
    });
  });

  it('zobrazí chybu při neúspěšném přihlášení', async () => {
    render(<LoginForm />);
    
    const usernameInput = screen.getByLabelText(/uživatelské jméno/i);
    const passwordInput = screen.getByLabelText(/heslo/i);
    const submitButton = screen.getByRole('button', { name: /přihlásit/i });
    
    const user = userEvent.setup();
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'wrongpassword');
    
    (signIn as jest.Mock).mockResolvedValueOnce({ error: 'Invalid credentials' });
    
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/nesprávné přihlašovací údaje/i)).toBeInTheDocument();
    });
  });

  it('přesměruje uživatele po úspěšném přihlášení', async () => {
    const mockRouter = {
      push: jest.fn(),
      refresh: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    render(<LoginForm />);
    
    const usernameInput = screen.getByLabelText(/uživatelské jméno/i);
    const passwordInput = screen.getByLabelText(/heslo/i);
    const submitButton = screen.getByRole('button', { name: /přihlásit/i });
    
    const user = userEvent.setup();
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    
    (signIn as jest.Mock).mockResolvedValueOnce({ error: null });
    
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/');
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });
}); 