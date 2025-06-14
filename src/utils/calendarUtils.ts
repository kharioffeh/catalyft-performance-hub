
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { QueryClient } from '@tanstack/react-query';

export const getEventColor = (type: string) => {
  switch (type) {
    case 'strength':
      return '#00FF7B';
    case 'technical':
      return '#5BAFFF';
    case 'recovery':
      return '#EC4899'; // Tailwind pink-500
    case 'conditioning':
      return '#FB923C'; // Tailwind orange-400
    case 'assessment':
      return '#A855F7'; // Tailwind purple-500
    default:
      return '#6B7280';
  }
};

export const handleEventDrop = async (info: any, queryClient: QueryClient) => {
  const sessionId = info.event.id;
  const newStart = info.event.start;
  const newEnd = info.event.end;

  try {
    const { error } = await supabase
      .from('sessions')
      .update({
        start_ts: newStart.toISOString(),
        end_ts: newEnd.toISOString(),
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating session:', error);
      info.revert();
      toast({
        title: "Error",
        description: "Failed to update session time",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Session time updated successfully",
    });

    // Invalidate and refetch sessions
    queryClient.invalidateQueries({ queryKey: ['sessions'] });
  } catch (error) {
    console.error('Error updating session:', error);
    info.revert();
    toast({
      title: "Error",
      description: "Failed to update session time",
      variant: "destructive",
    });
  }
};

export const handleEventResize = async (info: any, queryClient: QueryClient) => {
  const sessionId = info.event.id;
  const newStart = info.event.start;
  const newEnd = info.event.end;

  try {
    const { error } = await supabase
      .from('sessions')
      .update({
        start_ts: newStart.toISOString(),
        end_ts: newEnd.toISOString(),
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating session:', error);
      info.revert();
      toast({
        title: "Error",
        description: "Failed to update session duration",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Session duration updated successfully",
    });

    // Invalidate and refetch sessions
    queryClient.invalidateQueries({ queryKey: ['sessions'] });
  } catch (error) {
    console.error('Error updating session:', error);
    info.revert();
    toast({
      title: "Error",
      description: "Failed to update session duration",
      variant: "destructive",
    });
  }
};
