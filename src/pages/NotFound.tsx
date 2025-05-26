
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/AppLayout';

const NotFound: React.FC = () => {
  return (
    <AppLayout>
      <div className="min-h-96 flex flex-col items-center justify-center text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button className="rounded-2xl px-6 py-2 shadow-sm">
            Go Home
          </Button>
        </Link>
      </div>
    </AppLayout>
  );
};

export default NotFound;
