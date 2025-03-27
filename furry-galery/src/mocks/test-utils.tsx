import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import { mockSession } from './nextauth';

// Provider Wrapper pro testy
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: Session | null;
}

// Wrapper s NextAuth session providerem
const AllTheProviders = ({
  children,
  session = mockSession,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) => {
  return <SessionProvider session={session}>{children}</SessionProvider>;
};

// Custom render s providery
export const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const { session, ...renderOptions } = options || {};
  return render(ui, {
    wrapper: (props) => AllTheProviders({ ...props, session }),
    ...renderOptions,
  });
};

// Export všech funkcí z testing-library
export * from '@testing-library/react';
export { customRender as render }; 