import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
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
}

const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const startTime = format(new Date(session.start_ts), 'HH:mm');
  
  return (
    <View style={{
      marginBottom: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)'
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Dumbbell size={10} />
        <Text style={{ fontSize: 12, color: 'white', fontWeight: '500' }}>
          {startTime}
        </Text>
        <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)', textTransform: 'capitalize' }}>
          {session.type}
        </Text>
      </View>
    </View>
  );
};

interface DayCardProps {
  day: CalendarDay;
  isWeekView?: boolean;
}

const DayCard: React.FC<DayCardProps> = ({ day, isWeekView = false }) => {
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
          <SessionCard key={session.id} session={session} />
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
            <FlatList
              data={calendarDays}
              renderItem={({ item }) => <DayCard day={item} />}
              numColumns={7}
              key="month"
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1 }}
          >
            <View style={{ flexDirection: 'row' }}>
              {calendarDays.map((day, index) => (
                <DayCard key={index} day={day} isWeekView />
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};