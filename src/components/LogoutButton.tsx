'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export function LogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut({ 
        callbackUrl: '/login',
        redirect: true 
      });
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
      title="Logout"
    >
      <LogOut size={16} />
      Logout
    </button>
  );
}
