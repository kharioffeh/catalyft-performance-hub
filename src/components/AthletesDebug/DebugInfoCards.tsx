
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DebugInfoCardsProps {
  profile: any;
  coachData: any;
  athletes: any[];
  isLoading: boolean;
}

export const DebugInfoCards: React.FC<DebugInfoCardsProps> = ({
  profile,
  coachData,
  athletes,
  isLoading
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-600">Email: {profile?.email}</p>
          <p className="text-xs text-gray-600">Role: {profile?.role}</p>
          <p className="text-xs text-gray-600">ID: {profile?.id}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Coach Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-600">Coach ID: {coachData?.id}</p>
          <p className="text-xs text-gray-600">Status: {coachData ? 'Found' : 'Not Found'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Athletes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-600">Count: {athletes?.length || 0}</p>
          <p className="text-xs text-gray-600">Loading: {isLoading ? 'Yes' : 'No'}</p>
        </CardContent>
      </Card>
    </div>
  );
};
