
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, profile, loading } = useAuth();

  console.log('AppLayout: Rendering with user:', !!user, 'profile:', !!profile, 'loading:', loading);

  if (loading) {
    console.log('AppLayout: Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    console.log('AppLayout: No user or profile, returning null');
    return null; // Auth will handle redirect
  }

  console.log('AppLayout: Rendering main layout');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Fixed Left Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 ml-20"> {/* 80px sidebar width */}
        <TopBar />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
