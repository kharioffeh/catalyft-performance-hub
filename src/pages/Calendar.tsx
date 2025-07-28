
import React, { useState, useMemo } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { useAuth } from '@/contexts/AuthContext';
import { useSessions, useUpdateSession } from '@/hooks/useSessions';
import { SessionDrawer } from '@/components/SessionDrawer';
import { Session } from '@/types/training';
import { GlassLayout } from '@/components/Glass/GlassLayout';
import { GlassContainer } from '@/components/Glass/GlassContainer';
import { CalendarSessionCard } from '@/components/calendar/CalendarSessionCard.native';

// Configure locale for calendar
LocaleConfig.locales.en = LocaleConfig.locales[''];
LocaleConfig.defaultLocale = 'en';

interface MarkedDates {
  [date: string]: {
    marked?: boolean;
    dotColor?: string;
    selected?: boolean;
    selectedColor?: string;
    customStyles?: {
      container?: object;
      text?: object;
    };
  };
}

const CalendarPage: React.FC = () => {
  const { profile } = useAuth();
  const { data: allSessions = [], isLoading, refetch } = useSessions();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const updateSession = useUpdateSession();

  // Filter sessions to only show current user's sessions
  const mySessions = allSessions.filter(session => 
    profile && session.user_uuid === profile.id
  );

  // Get sessions for the selected date
  const selectedDateSessions = useMemo(() => {
    return mySessions.filter(session => {
      const sessionDate = new Date(session.start_ts).toISOString().split('T')[0];
      return sessionDate === selectedDate;
    });
  }, [mySessions, selectedDate]);

  // Create marked dates for calendar
  const markedDates = useMemo(() => {
    const marked: MarkedDates = {};
    
    mySessions.forEach(session => {
      const date = new Date(session.start_ts).toISOString().split('T')[0];
      const isPR = session.isPR;
      
      if (!marked[date]) {
        marked[date] = {
          marked: true,
          dotColor: isPR ? '#FFD700' : '#5BAFFF', // Gold for PR days, blue for normal sessions
        };
      } else if (isPR && marked[date].dotColor !== '#FFD700') {
        // If there's a PR on this date, prioritize the gold color
        marked[date].dotColor = '#FFD700';
      }
    });

    // Mark selected date
    if (marked[selectedDate]) {
      marked[selectedDate].selected = true;
      marked[selectedDate].selectedColor = '#5BAFFF';
    } else {
      marked[selectedDate] = {
        selected: true,
        selectedColor: '#5BAFFF',
      };
    }

    return marked;
  }, [mySessions, selectedDate]);

  const handleSessionClick = (session: Session) => {
    if (profile && session.user_uuid === profile.id) {
      setSelectedSession(session);
      setIsDrawerOpen(true);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleSessionReorder = async ({ data }: { data: Session[] }) => {
    try {
      // Update each session with new timing based on order
      const baseDate = new Date(selectedDate);
      const promises = data.map(async (session, index) => {
        // Space sessions 2 hours apart starting from 8 AM
        const newStartTime = new Date(baseDate);
        newStartTime.setHours(8 + (index * 2), 0, 0, 0);
        
        const newEndTime = new Date(newStartTime);
        newEndTime.setHours(newStartTime.getHours() + 1); // 1 hour sessions
        
        return updateSession.mutateAsync({
          id: session.id,
          start_ts: newStartTime.toISOString(),
          end_ts: newEndTime.toISOString(),
        });
      });
      
      await Promise.all(promises);
      await refetch();
    } catch (error) {
      console.error('Failed to reorder sessions:', error);
    }
  };

  const renderSessionItem = ({ item, drag, isActive }: RenderItemParams<Session>) => (
    <ScaleDecorator>
      <TouchableOpacity
        onLongPress={drag}
        onPress={() => handleSessionClick(item)}
        style={[
          styles.sessionItem,
          isActive && styles.activeSessionItem,
        ]}
        disabled={isActive}
      >
        <CalendarSessionCard
          session={item}
          onLongPress={drag}
          isActive={isActive}
        />
      </TouchableOpacity>
    </ScaleDecorator>
  );

  if (isLoading) {
    return (
      <GlassLayout variant="dashboard">
        <GlassContainer className="min-h-screen">
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading calendar...</Text>
          </View>
        </GlassContainer>
      </GlassLayout>
    );
  }

  return (
    <GlassLayout variant="dashboard">
      <GlassContainer className="min-h-screen">
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Calendar */}
          <View style={styles.calendarContainer}>
            <Calendar
              current={selectedDate}
              onDayPress={(day) => handleDateSelect(day.dateString)}
              markedDates={markedDates}
              theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'rgba(255, 255, 255, 0.1)',
                textSectionTitleColor: '#ffffff',
                textSectionTitleDisabledColor: '#d9e1e8',
                selectedDayBackgroundColor: '#5BAFFF',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#5BAFFF',
                dayTextColor: '#ffffff',
                textDisabledColor: 'rgba(255, 255, 255, 0.3)',
                dotColor: '#5BAFFF',
                selectedDotColor: '#ffffff',
                arrowColor: '#5BAFFF',
                disabledArrowColor: '#d9e1e8',
                monthTextColor: '#ffffff',
                indicatorColor: '#5BAFFF',
                textDayFontFamily: 'System',
                textMonthFontFamily: 'System',
                textDayHeaderFontFamily: 'System',
                textDayFontWeight: '500',
                textMonthFontWeight: '600',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
              }}
              style={styles.calendar}
            />
          </View>

          {/* Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#5BAFFF' }]} />
              <Text style={styles.legendText}>Normal Session</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FFD700' }]} />
              <Text style={styles.legendText}>PR Day</Text>
            </View>
          </View>

          {/* Selected Date Sessions */}
          <View style={styles.sessionsContainer}>
            <Text style={styles.sectionTitle}>
              Sessions for {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
            
            {selectedDateSessions.length > 0 ? (
              <View style={styles.draggableContainer}>
                <Text style={styles.instructionText}>
                  Long press and drag to reorder sessions
                </Text>
                <DraggableFlatList
                  data={selectedDateSessions}
                  renderItem={renderSessionItem}
                  keyExtractor={(item) => item.id}
                  onDragEnd={handleSessionReorder}
                  contentContainerStyle={styles.flatListContent}
                />
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No sessions scheduled for this date</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Session Drawer */}
        <SessionDrawer
          session={selectedSession}
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
        />
      </GlassContainer>
    </GlassLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
  calendarContainer: {
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  calendar: {
    borderRadius: 12,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  sessionsContainer: {
    flex: 1,
    minHeight: 200,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  draggableContainer: {
    flex: 1,
  },
  instructionText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  flatListContent: {
    paddingBottom: 20,
  },
  sessionItem: {
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeSessionItem: {
    backgroundColor: 'rgba(91, 175, 255, 0.2)',
    borderColor: '#5BAFFF',
    transform: [{ scale: 1.02 }],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 120,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CalendarPage;
