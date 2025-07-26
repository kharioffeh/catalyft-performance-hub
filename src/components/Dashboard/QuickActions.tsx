
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  userRole?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ userRole }) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Navigate to key areas of your training platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-12"
            onClick={() => navigate('/analytics')}
          >
            <BarChart3 className="w-5 h-5" />
            Detailed Analytics
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-12"
            onClick={() => navigate('/calendar')}
          >
            <Calendar className="w-5 h-5" />
            Training Calendar
          </Button>
          {/* Coach actions removed for solo experience */}
        </div>
      </CardContent>
    </Card>
  );
};
