import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import ChildDashboard from '../pages/ChildDashboard';
import ParentDashboard from '../pages/ParentDashboard';
import LoginPage from '../pages/LoginPage';
import RoleSwitcher from '../components/RoleSwitcher';

const AppRouter: React.FC = () => {
  const { isAuthenticated, currentUser } = useApp();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && <RoleSwitcher />}
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                currentUser?.role === 'child' ? (
                  <ChildDashboard />
                ) : (
                  <ParentDashboard />
                )
              ) : (
                <LoginPage />
              )
            }
          />
          <Route
            path="/child"
            element={
              isAuthenticated && currentUser?.role === 'child' ? (
                <ChildDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/parent"
            element={
              isAuthenticated && currentUser?.role === 'parent' ? (
                <ParentDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default AppRouter;
