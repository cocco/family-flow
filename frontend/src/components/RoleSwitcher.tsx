import React from 'react';
import { useApp } from '../contexts/AppContext';

const RoleSwitcher: React.FC = () => {
  const { currentUser, switchRole } = useApp();

  if (!currentUser) {
    return null;
  }

  const handleRoleSwitch = (role: 'parent' | 'child'): void => {
    switchRole(role);
  };

  return (
    <div className="bg-indigo-600 text-white px-4 py-2">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <span className="text-sm font-medium">
          Development Mode - Role Switcher
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => handleRoleSwitch('parent')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              currentUser.role === 'parent'
                ? 'bg-white text-indigo-600'
                : 'bg-indigo-500 hover:bg-indigo-400'
            }`}
          >
            Parent
          </button>
          <button
            onClick={() => handleRoleSwitch('child')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              currentUser.role === 'child'
                ? 'bg-white text-indigo-600'
                : 'bg-indigo-500 hover:bg-indigo-400'
            }`}
          >
            Child
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSwitcher;
