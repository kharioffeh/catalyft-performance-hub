import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Dumbbell } from 'lucide-react-native';
import { useCalendar } from '@/hooks/useCalendar';
import { Session } from '@/types/training';

interface CalendarDay {
  date: Date;
  sessions: Session[];
  isCurrentMonth: boolean;
}

interface SessionCardProps {
  session: Session;
  onPress?: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onPress }) => {
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

  const borderColor = session.isPR ? '#5BAFFF' : getLoadBorderColor(session.loadPercent);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        marginBottom: 4,
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 6,
        borderLeftWidth: 3,
        borderLeftColor: borderColor,
      }}
    >
      <Text style={{ color: 'white', fontWeight: '600', fontSize: 12 }}>
        {session.title || 'My Workout'}
      </Text>
      <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 10 }}>
        {startTime}
      </Text>
      {session.loadPercent !== undefined && (
        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 10 }}>
          Load: {session.loadPercent}%
        </Text>
      )}
      {session.isPR && (
        <Text style={{ color: '#5BAFFF', fontSize: 10, fontWeight: '600' }}>
          🏅 PR!
        </Text>
      )}
    </TouchableOpacity>
  );
};

interface DayCardProps {
  day: CalendarDay;
  isWeekView?: boolean;
  onSessionPress?: (session: Session) => void;
}

const DayCard: React.FC<DayCardProps> = ({ day, isWeekView = false, onSessionPress }) => {
  const isToday_ = isToday(day.date);
  const dayNumber = format(day.date, 'd');
  
  return (
    <View style={{
      minHeight: isWeekView ? 120 : 100,
      width: isWeekView ? 140 : undefined,
      margin: isWeekView ? 4 : 2,
      padding: 8,
      backgroundColor: isToday_ ? 'rgba(91, 175, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
      borderRadius: 8,
      borderWidth: isToday_ ? 1 : 0,
      borderColor: isToday_ ? '#5BAFFF' : 'transparent',
      opacity: day.isCurrentMonth ? 1 : 0.5,
    }}>
      <Text style={{
        color: isToday_ ? '#5BAFFF' : 'white',
        fontWeight: isToday_ ? '700' : '600',
        fontSize: 14,
        marginBottom: 4,
      }}>
        {dayNumber}
      </Text>
      
      {day.sessions.slice(0, 3).map((session) => (
        <SessionCard 
          key={session.id} 
          session={session} 
          onPress={() => onSessionPress?.(session)}
        />
      ))}
      
      {day.sessions.length > 3 && (
        <Text style={{ color: '#5BAFFF', fontSize: 10, fontWeight: '600' }}>
          +{day.sessions.length - 3} more
        </Text>
      )}
    </View>
  );
};

export const CalendarScreen: React.FC = () => {
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const { sessions, isLoading } = useCalendar();

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

  const handleSessionPress = (session: Session) => {
    // Handle session press - could navigate to session details
  };

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

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#1a1b23' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#5BAFFF" />
          <Text style={{ color: 'white', marginTop: 16, fontSize: 16 }}>
            Loading your sessions...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1a1b23' }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)'
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <CalendarIcon size={24} color="white" />
          <Text style={{ 
            color: 'white', 
            fontSize: 20, 
            fontWeight: '700', 
            marginLeft: 8 
          }}>
            My Calendar
          </Text>
        </View>
      </View>

      {/* Navigation */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16
      }}>
        <TouchableOpacity onPress={handlePrevious} style={{ padding: 8 }}>
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        
        <Text style={{ 
          color: 'white', 
          fontSize: 18, 
          fontWeight: '600',
          flex: 1,
          textAlign: 'center'
        }}>
          {monthLabel}
        </Text>
        
        <TouchableOpacity onPress={handleNext} style={{ padding: 8 }}>
          <ChevronRight size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* View Mode Toggle */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
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
        {viewMode === 'month' ? (
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
                      onSessionPress={handleSessionPress}
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
                  onSessionPress={handleSessionPress}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};