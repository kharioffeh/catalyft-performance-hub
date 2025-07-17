import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
interface DashboardHeaderProps {
  userRole?: string;
}
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userRole
}) => {
  const navigate = useNavigate();
  const getTitle = () => {
    switch (userRole) {
      case 'coach':
        return 'Coach Dashboard';
      case 'solo-athlete':
        return 'My Training Dashboard';
      case 'coached-athlete':
        return 'Athlete Dashboard';
      default:
        return 'Dashboard';
    }
  };
  return <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-50">
          {getTitle()}
        </h1>
        <p className="text-slate-50">
          {format(new Date(), 'EEEE, MMMM do, yyyy')}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate('/analytics')} className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          View Analytics
        </Button>
        <Button onClick={() => navigate('/calendar')} className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Schedule
        </Button>
      </div>
    </div>;
};