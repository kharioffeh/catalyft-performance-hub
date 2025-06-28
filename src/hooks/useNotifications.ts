
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  type: 'digest' | 'reminder' | 'system' | 'daily_summary' | 'missed_workout' | 'abnormal_readiness';
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  meta?: Record<string, any>;
}

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      return data as Notification[];
    },
  });

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return;
    }

    // Optimistically update the cache
    queryClient.setQueryData(['notifications'], (old: Notification[] = []) =>
      old.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    
    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', unreadIds);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return;
    }

    // Optimistically update the cache
    queryClient.setQueryData(['notifications'], (old: Notification[] = []) =>
      old.map(notification => ({ ...notification, read: true }))
    );
  };

  // Set up real-time listener with toast notifications
  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          console.log('New notification received:', newNotification);
          
          // Show toast notification for new notifications
          if (newNotification.type === 'abnormal_readiness') {
            toast.error(newNotification.title, {
              description: newNotification.body,
              duration: 8000,
            });
          } else if (newNotification.type === 'missed_workout') {
            toast.warning(newNotification.title, {
              description: newNotification.body,
              duration: 6000,
            });
          } else if (newNotification.type === 'daily_summary') {
            toast.success(newNotification.title, {
              description: "Your daily summary is ready",
              duration: 4000,
            });
          } else {
            toast.info(newNotification.title, {
              description: newNotification.body,
              duration: 4000,
            });
          }
          
          // Invalidate and refetch notifications
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications'
        },
        () => {
          // Invalidate and refetch notifications when changes occur
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
};
