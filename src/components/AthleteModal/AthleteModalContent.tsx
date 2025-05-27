
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AthleteChart } from '@/components/AthleteChart';
import { AthleteSessionsTable } from '@/components/AthleteSessionsTable';

interface AthleteModalContentProps {
  athleteId: string;
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const AthleteModalContent: React.FC<AthleteModalContentProps> = ({
  athleteId,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex-1 p-6 overflow-hidden">
      <Tabs 
        value={activeTab} 
        onValueChange={onTabChange}
        className="h-full flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trends">7-Day Trends</TabsTrigger>
          <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trends" className="flex-1 mt-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Readiness & Load Trends</CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              <AthleteChart 
                athleteId={athleteId} 
                isVisible={activeTab === 'trends'}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sessions" className="flex-1 mt-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent className="h-full overflow-auto">
              <AthleteSessionsTable athleteId={athleteId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
