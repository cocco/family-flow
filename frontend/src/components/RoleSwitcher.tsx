import React from 'react';
import { useApp } from '../contexts/AppContext';
import { usersFixture } from '../api/fixtures';
import type { UserDto } from '../api/types';

const RoleSwitcher: React.FC = () => {
  const { currentUser, login } = useApp();

  if (!currentUser) {
    return null;
  }

  const handleRoleSwitch = (role: 'parent' | 'child'): void => {
    const targetUser: UserDto | undefined =
      role === 'parent'
        ? usersFixture.find((u) => u.role === 'parent')
        : usersFixture.find((u) => u.role === 'child');
    if (targetUser) {
      login(targetUser);
    }
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
