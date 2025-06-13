
import React, { useState, useEffect } from 'react';
import { useEnhancedMetricsWithAthlete } from '@/hooks/useEnhancedMetricsWithAthlete';
import { useAuth } from '@/contexts/AuthContext';
import { useAthletes } from '@/hooks/useAthletes';
import { useMetricData } from '@/hooks/useMetricData';
import { AnalyticsHeader } from '@/components/Analytics/AnalyticsHeader';
import { AnalyticsKPICards } from '@/components/Analytics/AnalyticsKPICards';
import { AnalyticsMiniSparks } from '@/components/Analytics/AnalyticsMiniSparks';
import { AnalyticsCharts } from '@/components/Analytics/AnalyticsCharts';
import { AnalyticsDataTables } from '@/components/Analytics/AnalyticsDataTables';
import { AnalyticsInsights } from '@/components/Analytics/AnalyticsInsights';
import { GlassContainer } from '@/components/Glass/GlassContainer';

const Analytics: React.FC = () => {
  const { profile } = useAuth();
  const { athletes } = useAthletes();
  
  // State for selected athlete and period
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('');
  const [period, setPeriod] = useState<1 | 7 | 30 | 90>(30);

  // Set default selected athlete when data loads
  useEffect(() => {
    if (profile?.role === 'coach' && athletes.length > 0 && !selectedAthleteId) {
      setSelectedAthleteId(athletes[0].id);
    } else if (profile?.role !== 'coach' && profile?.id && !selectedAthleteId) {
      setSelectedAthleteId(profile.id);
    }
  }, [profile, athletes, selectedAthleteId]);

  // Fetch enhanced metrics
  const { readinessRolling, sleepDaily, loadACWR, latestStrain } = useEnhancedMetricsWithAthlete(selectedAthleteId);
  
  // Fetch metric data with period selector
  const { data: readinessData } = useMetricData("readiness", period);
  const { data: sleepData } = useMetricData("sleep", period);
  const { data: loadData } = useMetricData("load", period);

  // Get selected athlete name for display
  const selectedAthlete = athletes.find(a => a.id === selectedAthleteId);
  const displayName = profile?.role === 'coach' ? selectedAthlete?.name || 'Unknown Athlete' : 'My Analytics';

  const isHourlyView = period === 1;

  if (!selectedAthleteId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/50"></div>
      </div>
    );
  }

  const readinessChartData = readinessData?.series?.map(item => ({
    x: item.x,
    y: item.y,
    hour: item.hour
  })) || [];

  const sleepChartData = sleepData?.series?.map(item => ({
    x: item.x,
    y: item.y,
    deep: item.deep || 0,
    light: item.light || 0,
    rem: item.rem || 0,
    hour: item.hour
  })) || [];

  const loadChartData = loadData?.series?.map(item => ({
    x: item.x,
    y: item.y,
    hour: item.hour
  })) || [];

  // Fix the loadSecondaryData to include y property for compatibility
  const loadSecondaryData = loadData?.secondary?.map(item => ({
    x: item.x,
    y: (item.acute || 0) + (item.chronic || 0), // Combined value for y
    acute: item.acute || 0,
    chronic: item.chronic || 0,
    hour: item.hour
  })) || [];

  const readinessZones = [
    { from: 0, to: 50, color: "#ef4444", label: "Poor" },
    { from: 50, to: 70, color: "#f59e0b", label: "Fair" },
    { from: 70, to: 85, color: "#10b981", label: "Good" },
    { from: 85, to: 100, color: "#059669", label: "Excellent" }
  ];

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <GlassContainer padding="md">
        <AnalyticsHeader
          displayName={displayName}
          isHourlyView={isHourlyView}
          period={period}
          onPeriodChange={setPeriod}
          selectedAthleteId={selectedAthleteId}
          onAthleteChange={setSelectedAthleteId}
          isCoach={profile?.role === 'coach'}
        />
      </GlassContainer>

      <AnalyticsKPICards
        readinessData={readinessData}
        sleepData={sleepData}
        loadData={loadData}
        latestStrain={latestStrain}
      />

      <AnalyticsMiniSparks
        readinessData={readinessData}
        sleepData={sleepData}
        loadData={loadData}
        isHourlyView={isHourlyView}
      />

      <GlassContainer padding="lg">
        <AnalyticsCharts
          readinessChartData={readinessChartData}
          sleepChartData={sleepChartData}
          loadChartData={loadChartData}
          loadSecondaryData={loadSecondaryData}
          readinessZones={readinessZones}
          loadZones={loadData?.zones || []}
          isHourlyView={isHourlyView}
        />
      </GlassContainer>

      <GlassContainer padding="lg">
        <AnalyticsDataTables
          readinessData={readinessData}
          sleepData={sleepData}
          isHourlyView={isHourlyView}
        />
      </GlassContainer>

      <GlassContainer padding="lg">
        <AnalyticsInsights
          isHourlyView={isHourlyView}
          period={period}
        />
      </GlassContainer>
    </div>
  );
};

export default Analytics;
