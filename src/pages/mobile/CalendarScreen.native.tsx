import React, { useState, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert 
} from 'react-native';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Dumbbell } from 'lucide-react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import * as Haptics from 'expo-haptics';
import { useCalendar } from '@/hooks/useCalendar';
import { Session } from '@/types/training';
import { rescheduleSession } from '@/lib/api/sessions';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface CalendarDay {
  date: Date;
  sessions: Session[];
  isCurrentMonth: boolean;
}

interface DraggableSessionData {
  session: Session;
  date: Date;
  originalIndex: number;
}

interface SessionCardProps {
  session: Session;
  onLongPress?: () => void;
  isActive?: boolean;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onLongPress, isActive }) => {
  const startTime = format(new Date(session.start_ts), 'HH:mm');
  
  const getLoadBorderColor = (loadPercent?: number): string => {
    if (loadPercent === undefined) return 'rgba(255, 255, 255, 0.2)';
    
    // HSL formula: hsl(120 - 120*loadPercent/100, 80%, 60%)
    const hue = Math.max(0, 120 - (120 * loadPercent) / 100);
    const saturation = 80;
    const lightness = 60;
    
    // Convert HSL to RGB for React Native
    const c = (1 - Math.abs(2 * lightness / 100 - 1)) * saturation / 100;
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = lightness / 100 - c / 2;
    
    let r = 0, g = 0, b = 0;
    if (hue < 60) {
      r = c; g = x; b = 0;
    } else if (hue < 120) {
      r = x; g = c; b = 0;
    } else if (hue < 180) {
      r = 0; g = c; b = x;
    } else if (hue < 240) {
      r = 0; g = x; b = c;
    } else if (hue < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }
    
    const red = Math.round((r + m) * 255);
    const green = Math.round((g + m) * 255);
    const blue = Math.round((b + m) * 255);
    
    return `rgb(${red}, ${green}, ${blue})`;
  };

  const getLoadInfo = (session: Session): string => {
    const loadText = session.loadPercent !== undefined ? `Load: ${session.loadPercent}%` : 'Load: N/A';
    const prText = session.isPR ? '\nPR Achieved! 🏅' : '';
    return loadText + prText;
  };

  const borderColor = session.isPR ? '#5BAFFF' : getLoadBorderColor(session.loadPercent);

  const handlePress = () => {
    Alert.alert(
      'Session Details',
      getLoadInfo(session),
      [{ text: 'OK' }]
    );
  };

  return (
    <TouchableOpacity
      onLongPress={onLongPress}
      onPress={handlePress}
      delayLongPress={500}
      style={{
        marginBottom: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: isActive ? 'rgba(91, 175, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
        borderWidth: 2,
        borderColor: borderColor,
        transform: [{ scale: isActive ? 1.05 : 1 }],
        position: 'relative',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Dumbbell size={10} />
        <Text style={{ fontSize: 12, color: 'white', fontWeight: '500' }}>
          {startTime}
        </Text>
        <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)', textTransform: 'capitalize' }}>
          {session.type}
        </Text>
      </View>
      
      {/* PR Badge */}
      {session.isPR && (
        <View style={{
          position: 'absolute',
          top: -4,
          right: -4,
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: '#5BAFFF',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 10 }}>🏅</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

interface DayCardProps {
  day: CalendarDay;
  isWeekView?: boolean;
  onSessionLongPress?: (session: Session, date: Date) => void;
}

const DayCard: React.FC<DayCardProps> = ({ day, isWeekView = false, onSessionLongPress }) => {
  const isToday_ = isToday(day.date);
  const dayNumber = format(day.date, 'd');
  const weekdayLabel = format(day.date, 'EEE');
  const maxSessions = isWeekView ? 5 : 3;
  const visibleSessions = day.sessions.slice(0, maxSessions);
  const extraSessions = day.sessions.length - maxSessions;

  return (
    <TouchableOpacity 
      style={{
        width: isWeekView ? 96 : undefined,
        height: isWeekView ? 128 : 96,
        flex: isWeekView ? 0 : 1,
        margin: 4,
        padding: 12,
        borderRadius: 16,
        backgroundColor: isToday_ ? 'rgba(91, 175, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: isToday_ ? 'rgba(91, 175, 255, 0.6)' : 'rgba(255, 255, 255, 0.1)',
        opacity: day.isCurrentMonth ? 1 : 0.5
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        {isWeekView && (
          <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)', fontWeight: '500' }}>
            {weekdayLabel}
          </Text>
        )}
        <Text 
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: isToday_ ? '#5BAFFF' : (day.isCurrentMonth ? 'white' : 'rgba(255, 255, 255, 0.5)')
          }}
        >
          {dayNumber}
        </Text>
        {isToday_ && (
          <View style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: '#5BAFFF'
          }} />
        )}
      </View>

      <View style={{ flex: 1 }}>
        {visibleSessions.map((session) => (
          <SessionCard 
            key={session.id} 
            session={session} 
            onLongPress={() => onSessionLongPress?.(session, day.date)}
          />
        ))}
        
        {extraSessions > 0 && (
          <Text style={{ fontSize: 12, color: '#5BAFFF', fontWeight: '500', marginTop: 4 }}>
            +{extraSessions} more
          </Text>
        )}
        
        {day.sessions.length === 0 && !isWeekView && (
          <Text style={{ 
            fontSize: 12, 
            color: 'rgba(255, 255, 255, 0.4)', 
            textAlign: 'center', 
            marginTop: 8 
          }}>
            No sessions
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const DraggableSessionItem = ({ 
  item, 
  drag, 
  isActive 
}: RenderItemParams<DraggableSessionData>) => {
  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    drag();
  }, [drag]);

  return (
    <ScaleDecorator>
      <TouchableOpacity
        onLongPress={handleLongPress}
        delayLongPress={300}
        style={{
          margin: 4,
          padding: 12,
          borderRadius: 12,
          backgroundColor: isActive ? 'rgba(91, 175, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          borderColor: isActive ? '#5BAFFF' : 'rgba(255, 255, 255, 0.2)',
          shadowColor: isActive ? '#5BAFFF' : 'transparent',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isActive ? 0.3 : 0,
          shadowRadius: 8,
          elevation: isActive ? 8 : 2,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Dumbbell size={16} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, color: 'white', fontWeight: '600' }}>
              {format(new Date(item.session.start_ts), 'HH:mm')} - {item.session.type}
            </Text>
            <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }}>
              {format(item.date, 'MMM d, yyyy')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </ScaleDecorator>
  );
};

export const CalendarScreen: React.FC = () => {
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDragging, setIsDragging] = useState(false);
  const { sessions, isLoading } = useCalendar();
  const queryClient = useQueryClient();

  const calendarDays = useMemo(() => {
    if (viewMode === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calendarStart = startOfWeek(monthStart);
      const calendarEnd = endOfWeek(monthEnd);
      
      const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
      
      return days.map(day => ({
        date: day,
        sessions: sessions.filter(session => 
          session.planned_at && isSameDay(new Date(session.planned_at), day)
        ),
        isCurrentMonth: day >= monthStart && day <= monthEnd
      }));
    } else {
      // Week view
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(weekStart);
      
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      return days.map(day => ({
        date: day,
        sessions: sessions.filter(session => 
          session.planned_at && isSameDay(new Date(session.planned_at), day)
        ),
        isCurrentMonth: true
      }));
    }
  }, [currentDate, sessions, viewMode]);

  // Flatten all sessions for draggable list
  const draggableSessions = useMemo(() => {
    const allSessions: DraggableSessionData[] = [];
    let index = 0;
    
    calendarDays.forEach(day => {
      day.sessions.forEach(session => {
        allSessions.push({
          session,
          date: day.date,
          originalIndex: index++
        });
      });
    });
    
    return allSessions;
  }, [calendarDays]);

  const handleDragEnd = useCallback(async ({ data, from, to }: { 
    data: DraggableSessionData[], 
    from: number, 
    to: number 
  }) => {
    if (from === to) {
      setIsDragging(false);
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const movedSession = data[to];
      const targetDate = calendarDays[to % calendarDays.length]?.date || movedSession.date;
      
      // Format new date for the API
      const originalStartTime = new Date(movedSession.session.start_ts);
      const newStartTime = new Date(targetDate);
      newStartTime.setHours(originalStartTime.getHours());
      newStartTime.setMinutes(originalStartTime.getMinutes());
      
      // Optimistically update the UI
      setIsDragging(false);
      
      // Call the reschedule API
      await rescheduleSession(movedSession.session.id, newStartTime.toISOString());
      
      // Invalidate and refetch sessions
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      
      toast({ description: 'Session rescheduled successfully' });
      
    } catch (error) {
      console.error('Failed to reschedule session:', error);
      toast({ 
        description: 'Failed to reschedule session. Please try again.',
        variant: 'destructive'
      });
      
      // Revert the change by invalidating queries
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    }
  }, [calendarDays, queryClient]);

  const handleSessionLongPress = useCallback((session: Session, date: Date) => {
    setIsDragging(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Reschedule Session',
      'Long press and drag to reschedule this session to another day.',
      [{ text: 'OK', onPress: () => setIsDragging(false) }]
    );
  }, []);

  const handlePrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    } else {
      setCurrentDate(prev => subWeeks(prev, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    } else {
      setCurrentDate(prev => addWeeks(prev, 1));
    }
  };

  const monthLabel = format(currentDate, 'MMMM yyyy');
  const weekLabel = `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`;

  if (isLoading) {
    return (
      <SafeAreaView style={{ 
        flex: 1, 
        backgroundColor: '#1a1a2e',
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <ActivityIndicator size="large" color="#5BAFFF" />
        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: 16 }}>
          Loading calendar...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1a1a2e' }}>
      {/* Header */}
      <View style={{
        margin: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)'
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <CalendarIcon size={24} />
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>
              {viewMode === 'month' ? monthLabel : weekLabel}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              onPress={handlePrevious}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ChevronLeft size={20} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleNext}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ChevronRight size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* View Toggle */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 8,
          padding: 4
        }}>
          <TouchableOpacity
            onPress={() => setViewMode('month')}
            style={{
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 6,
              alignItems: 'center',
              backgroundColor: viewMode === 'month' ? '#5BAFFF' : 'transparent'
            }}
          >
            <Text style={{
              fontWeight: '500',
              color: viewMode === 'month' ? 'white' : 'rgba(255, 255, 255, 0.7)'
            }}>
              Month
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setViewMode('week')}
            style={{
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 6,
              alignItems: 'center',
              backgroundColor: viewMode === 'week' ? '#5BAFFF' : 'transparent'
            }}
          >
            <Text style={{
              fontWeight: '500',
              color: viewMode === 'week' ? 'white' : 'rgba(255, 255, 255, 0.7)'
            }}>
              Week
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Content */}
      <View style={{ flex: 1, padding: 16 }}>
        {isDragging && draggableSessions.length > 0 ? (
          <View style={{ flex: 1 }}>
            <Text style={{ 
              color: 'white', 
              fontSize: 16, 
              fontWeight: '600', 
              marginBottom: 16,
              textAlign: 'center'
            }}>
              Drag to reschedule session
            </Text>
            <DraggableFlatList
              data={draggableSessions}
              onDragEnd={handleDragEnd}
              keyExtractor={(item) => item.session.id}
              renderItem={DraggableSessionItem}
              containerStyle={{ flex: 1 }}
            />
          </View>
        ) : viewMode === 'month' ? (
          <View style={{ flex: 1 }}>
            {/* Weekday Headers */}
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((weekday) => (
                <View key={weekday} style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: 'rgba(255, 255, 255, 0.7)' }}>
                    {weekday}
                  </Text>
                </View>
              ))}
            </View>
            
            {/* Month Grid */}
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {calendarDays.map((day, index) => (
                  <View key={index} style={{ width: '14.28%' }}>
                    <DayCard 
                      day={day} 
                      onSessionLongPress={handleSessionLongPress}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1 }}
          >
            <View style={{ flexDirection: 'row' }}>
              {calendarDays.map((day, index) => (
                <DayCard 
                  key={index} 
                  day={day} 
                  isWeekView 
                  onSessionLongPress={handleSessionLongPress}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};