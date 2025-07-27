import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Meet {
  id: string;
  title: string;
  start_ts: string;
  end_ts: string;
  host_name?: string;
  rsvp_counts: {
    total: number;
    yes: number;
    no: number;
    maybe: number;
  };
}

interface RSVPStatus {
  [meetId: string]: 'yes' | 'no' | 'maybe' | null;
}

export const MeetsScreen: React.FC = () => {
  const [meets, setMeets] = useState<Meet[]>([]);
  const [loading, setLoading] = useState(true);
  const [rsvpStatuses, setRsvpStatuses] = useState<RSVPStatus>({});
  const [rsvpLoading, setRsvpLoading] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    fetchMeets();
  }, []);

  const fetchMeets = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('getMeets');
      
      if (error) {
        console.error('Error fetching meets:', error);
        toast({
          title: "Error",
          description: "Failed to load meets",
          variant: "destructive",
        });
        return;
      }

      if (data?.meets) {
        setMeets(data.meets);
      }
    } catch (error) {
      console.error('Error fetching meets:', error);
      toast({
        title: "Error",
        description: "Failed to load meets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (meetId: string, status: 'yes' | 'no' | 'maybe') => {
    setRsvpLoading(prev => ({ ...prev, [meetId]: true }));
    
    // Optimistic update
    const previousStatus = rsvpStatuses[meetId];
    setRsvpStatuses(prev => ({ ...prev, [meetId]: status }));
    
    // Update counts optimistically
    setMeets(prev => prev.map(meet => {
      if (meet.id === meetId) {
        const newCounts = { ...meet.rsvp_counts };
        
        // Remove from previous status
        if (previousStatus) {
          newCounts[previousStatus] = Math.max(0, newCounts[previousStatus] - 1);
          newCounts.total = Math.max(0, newCounts.total - 1);
        }
        
        // Add to new status
        newCounts[status] = newCounts[status] + 1;
        if (!previousStatus) {
          newCounts.total = newCounts.total + 1;
        }
        
        return { ...meet, rsvp_counts: newCounts };
      }
      return meet;
    }));

    try {
      const { error } = await supabase.functions.invoke('rsvpMeet', {
        body: { meet_id: meetId, status }
      });

      if (error) {
        // Revert optimistic update
        setRsvpStatuses(prev => ({ ...prev, [meetId]: previousStatus }));
        setMeets(prev => prev.map(meet => {
          if (meet.id === meetId) {
            const revertCounts = { ...meet.rsvp_counts };
            
            // Revert the changes
            revertCounts[status] = Math.max(0, revertCounts[status] - 1);
            if (previousStatus) {
              revertCounts[previousStatus] = revertCounts[previousStatus] + 1;
            } else {
              revertCounts.total = Math.max(0, revertCounts.total - 1);
            }
            
            return { ...meet, rsvp_counts: revertCounts };
          }
          return meet;
        }));
        
        console.error('Error updating RSVP:', error);
        toast({
          title: "Error",
          description: "Failed to update RSVP",
          variant: "destructive",
        });
      } else {
        toast({
          title: "RSVP Updated",
          description: `You've RSVP'd "${status}" to the meet`,
        });
      }
    } catch (error) {
      console.error('Error updating RSVP:', error);
      toast({
        title: "Error",
        description: "Failed to update RSVP",
        variant: "destructive",
      });
    } finally {
      setRsvpLoading(prev => ({ ...prev, [meetId]: false }));
    }
  };

  const addToCalendar = (meet: Meet) => {
    // Placeholder for calendar integration
    toast({
      title: "Calendar Integration",
      description: "Add to calendar feature would open native calendar here",
    });
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold text-white-90">Virtual Meets</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <GlassCard key={i} className="p-4 animate-pulse">
              <div className="h-6 bg-white/20 rounded mb-2"></div>
              <div className="h-4 bg-white/10 rounded mb-4"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-white/20 rounded flex-1"></div>
                <div className="h-8 bg-white/20 rounded flex-1"></div>
                <div className="h-8 bg-white/20 rounded flex-1"></div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-white-90">Virtual Meets</h1>
      
      {meets.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <Users className="w-12 h-12 text-white-60 mx-auto mb-4" />
          <p className="text-white-60">No upcoming meets available</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {meets.map((meet) => (
            <GlassCard key={meet.id} className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div>
                  <h3 className="text-lg font-semibold text-white-90">{meet.title}</h3>
                  {meet.host_name && (
                    <p className="text-sm text-white-60">Hosted by {meet.host_name}</p>
                  )}
                </div>

                {/* Time info */}
                <div className="flex items-center gap-2 text-sm text-white-70">
                  <Clock className="w-4 h-4" />
                  <span>
                    {format(new Date(meet.start_ts), 'MMM d, yyyy • h:mm a')}
                  </span>
                </div>

                {/* RSVP Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant={rsvpStatuses[meet.id] === 'yes' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleRSVP(meet.id, 'yes')}
                    disabled={rsvpLoading[meet.id]}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={rsvpStatuses[meet.id] === 'no' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleRSVP(meet.id, 'no')}
                    disabled={rsvpLoading[meet.id]}
                  >
                    No
                  </Button>
                  <Button
                    variant={rsvpStatuses[meet.id] === 'maybe' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleRSVP(meet.id, 'maybe')}
                    disabled={rsvpLoading[meet.id]}
                  >
                    Maybe
                  </Button>
                </div>

                {/* RSVP Counts */}
                <div className="flex items-center justify-between text-sm text-white-60">
                  <div className="flex gap-4">
                    <span>👍 {meet.rsvp_counts.yes} yes</span>
                    <span>❓ {meet.rsvp_counts.maybe} maybe</span>
                    <span>👎 {meet.rsvp_counts.no} no</span>
                  </div>
                  <span>{meet.rsvp_counts.total} total</span>
                </div>

                {/* Add to Calendar */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => addToCalendar(meet)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Add to Calendar
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeetsScreen;