
import React from 'react';
import { BarChart3, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '@/components/ui/GlassCard';

interface QuickActionsCardProps {
  userRole?: string;
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({ userRole }) => {
  const navigate = useNavigate();

  return (
    <GlassCard accent="primary" className="text-white overflow-hidden flex flex-col h-[460px] p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Quick Actions</h3>
        <p className="text-white/80 text-sm">Navigate to key areas of your training platform</p>
      </div>
      
      <div className="space-y-3 flex-1">
        <button 
          onClick={() => navigate('/analytics')}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-left"
        >
          <BarChart3 className="w-5 h-5 flex-shrink-0" />
          <div>
            <div className="font-medium">Detailed Analytics</div>
            <div className="text-xs text-white/70">View comprehensive performance data</div>
          </div>
        </button>
        
        <button 
          onClick={() => navigate('/calendar')}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-left"
        >
          <Calendar className="w-5 h-5 flex-shrink-0" />
          <div>
            <div className="font-medium">Training Calendar</div>
            <div className="text-xs text-white/70">Plan and schedule workouts</div>
          </div>
        </button>
        
        {/* Coach actions hidden for solo users */}
        {false && (
          <button 
            onClick={() => navigate('/athletes')}
            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-left"
          >
            <Users className="w-5 h-5 flex-shrink-0" />
            <div>
              <div className="font-medium">Manage Athletes</div>
              <div className="text-xs text-white/70">View and manage your team</div>
            </div>
          </button>
        )}
      </div>
    </GlassCard>
  );
};
