import React from 'react';
import { AppProvider } from './contexts/AppContext';
import AppRouter from './router/AppRouter';
import './config/env'; // Initialize environment validation

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
};

export default App;
