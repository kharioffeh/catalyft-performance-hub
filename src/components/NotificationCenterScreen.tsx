import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  BarChart3, 
  Clock, 
  AlertTriangle, 
  Mail, 
  Users, 
  Trophy,
  X,
  CheckCheck
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface NotificationCategory {
  key: string;
  label: string;
  icon: React.ReactNode;
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
  color: string;
}

const notificationCategories: NotificationCategory[] = [
  {
    key: 'daily_summary',
    label: 'Daily Summary',
    icon: <BarChart3 className="h-5 w-5" />,
    badgeVariant: 'secondary',
    color: 'bg-blue-500/10 border-blue-500/20'
  },
  {
    key: 'missed_workout',
    label: 'Workout Reminders',
    icon: <Clock className="h-5 w-5" />,
    badgeVariant: 'outline',
    color: 'bg-orange-500/10 border-orange-500/20'
  },
  {
    key: 'abnormal_readiness',
    label: 'Health Alerts',
    icon: <AlertTriangle className="h-5 w-5" />,
    badgeVariant: 'destructive',
    color: 'bg-red-500/10 border-red-500/20'
  },
  {
    key: 'digest',
    label: 'Weekly Digest',
    icon: <Mail className="h-5 w-5" />,
    badgeVariant: 'secondary',
    color: 'bg-purple-500/10 border-purple-500/20'
  },
  {
    key: 'social',
    label: 'Social',
    icon: <Users className="h-5 w-5" />,
    badgeVariant: 'default',
    color: 'bg-green-500/10 border-green-500/20'
  },
  {
    key: 'achievements',
    label: 'Achievements',
    icon: <Trophy className="h-5 w-5" />,
    badgeVariant: 'default',
    color: 'bg-yellow-500/10 border-yellow-500/20'
  }
];

export const NotificationCenterScreen: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());

  // Group notifications by category
  const groupedNotifications = notifications.reduce((acc, notification) => {
    const category = notification.type;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(notification);
    return acc;
  }, {} as Record<string, typeof notifications>);

  const handleSwipeLeft = (notificationId: string) => {
    setDismissedNotifications(prev => new Set(prev).add(notificationId));
    toast({
      title: "Notification dismissed",
      description: "You can view dismissed notifications in your settings",
    });
  };

  const handleNotificationClick = async (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(notificationId);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const getCategoryInfo = (type: string): NotificationCategory => {
    return notificationCategories.find(cat => cat.key === type) || notificationCategories[0];
  };

  const visibleNotifications = notifications.filter(n => !dismissedNotifications.has(n.id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMarkAllRead}
            className="flex items-center gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications by Category */}
      <ScrollArea className="h-[calc(100vh-200px)]">
        {visibleNotifications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No notifications</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedNotifications).map(([category, categoryNotifications]) => {
              const categoryInfo = getCategoryInfo(category);
              const visibleCategoryNotifications = categoryNotifications.filter(
                n => !dismissedNotifications.has(n.id)
              );
              
              if (visibleCategoryNotifications.length === 0) return null;

              return (
                <div key={category} className="space-y-3">
                  {/* Category Header */}
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${categoryInfo.color}`}>
                      {categoryInfo.icon}
                    </div>
                    <h2 className="text-lg font-semibold">{categoryInfo.label}</h2>
                    <Badge variant="outline" className="ml-auto">
                      {visibleCategoryNotifications.length}
                    </Badge>
                  </div>

                  {/* Category Notifications */}
                  <div className="space-y-3">
                    {visibleCategoryNotifications.map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        categoryInfo={categoryInfo}
                        onSwipeLeft={() => handleSwipeLeft(notification.id)}
                        onClick={() => handleNotificationClick(notification.id, notification.read)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

interface NotificationCardProps {
  notification: any;
  categoryInfo: NotificationCategory;
  onSwipeLeft: () => void;
  onClick: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  categoryInfo,
  onSwipeLeft,
  onClick
}) => {
  const swipeHandlers = useSwipeable({
    onSwipedLeft: onSwipeLeft,
    preventScrollOnSwipe: true,
    trackMouse: false,
    delta: 50,
    swipeDuration: 300,
  });

  return (
    <div {...swipeHandlers} className="relative">
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          notification.read 
            ? 'bg-background hover:bg-muted/50' 
            : 'bg-primary/5 border-primary/20 hover:bg-primary/10'
        }`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Category Icon */}
            <div className={`p-2 rounded-lg ${categoryInfo.color} flex-shrink-0`}>
              {categoryInfo.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-medium text-sm leading-tight mb-1">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {notification.body}
                  </p>
                </div>
                
                {/* Unread indicator */}
                {!notification.read && (
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </p>
                <Badge variant={categoryInfo.badgeVariant} className="text-xs">
                  {categoryInfo.label}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Swipe hint */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-end pr-4 opacity-0 hover:opacity-100 transition-opacity">
        <div className="bg-muted/80 rounded-full p-2">
          <X className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
};