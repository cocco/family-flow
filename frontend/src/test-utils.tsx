import React, { useEffect } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AppProvider, useApp } from './contexts/AppContext';
import type { UserDto } from './api/types';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  currentUser?: UserDto | null;
}

const TestWrapper: React.FC<{ children: React.ReactNode; currentUser?: UserDto | null }> = ({ 
  children, 
  currentUser = null 
}) => {
  const { login } = useApp();

  useEffect(() => {
    if (currentUser) {
      login(currentUser);
    }
  }, [currentUser, login]);

  return <>{children}</>;
};

const AllTheProviders: React.FC<{ children: React.ReactNode; currentUser?: UserDto | null }> = ({ 
  children, 
  currentUser = null 
}) => {
  return (
    <AppProvider>
      <TestWrapper currentUser={currentUser}>
        {children}
      </TestWrapper>
    </AppProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  { currentUser, ...renderOptions }: CustomRenderOptions = {}
) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders currentUser={currentUser}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

export * from '@testing-library/react';
export { customRender as render };
