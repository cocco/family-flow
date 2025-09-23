import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';

const LoginPage: React.FC = () => {
  const { login } = useApp();
  const [selectedUser, setSelectedUser] = useState<string>('');

  const mockUsers = [
    {
      id: '1',
      username: 'parent1',
      displayName: 'Parent User',
      role: 'parent' as const,
      monthlyAllowance: 0,
    },
    {
      id: '2',
      username: 'child1',
      displayName: 'Emma',
      role: 'child' as const,
      monthlyAllowance: 25.0,
    },
    {
      id: '3',
      username: 'child2',
      displayName: 'Alex',
      role: 'child' as const,
      monthlyAllowance: 20.0,
    },
  ];

  const handleLogin = (): void => {
    const user = mockUsers.find((u) => u.id === selectedUser);
    if (user) {
      login(user);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Family Flow
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="user-select" className="sr-only">
              Select User
            </label>
            <select
              id="user-select"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              required
            >
              <option value="">Select a user...</option>
              {mockUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.displayName} ({user.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="button"
              onClick={handleLogin}
              disabled={!selectedUser}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
