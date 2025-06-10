
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEnhancedMetricsWithAthlete } from '@/hooks/useEnhancedMetricsWithAthlete';
import { AthleteSelector } from '@/components/Analytics/AthleteSelector';
import { MetricCard } from '@/components/Analytics/MetricCard';
import { MiniSpark } from '@/components/Analytics/MiniSpark';
import { MetricChart } from '@/components/Analytics/MetricChart';
import { DataTable } from '@/components/Analytics/DataTable';
import { PeriodSelector } from '@/components/Analytics/PeriodSelector';
import { ARIAInsight } from '@/components/Analytics/ARIAInsight';
import { useAuth } from '@/contexts/AuthContext';
import { useAthletes } from '@/hooks/useAthletes';
import { useMetricData } from '@/hooks/useMetricData';
import { useNavigate } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import { Download, Filter, Calendar, TrendingUp, Activity, Moon, Dumbbell } from 'lucide-react';

const Analytics: React.FC = () => {
  const { profile } = useAuth();
  const { athletes } = useAthletes();
  const navigate = useNavigate();
  
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
          </div>
          <p className="text-gray-600">
            {profile?.role === 'coach' ? `Analyzing ${displayName}'s performance metrics` : 'Comprehensive performance insights and data trends'}
            {isHourlyView && " - 24 Hour View"}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <PeriodSelector period={period} onPeriodChange={setPeriod} />
          
          <AthleteSelector
            selectedAthleteId={selectedAthleteId}
            onAthleteChange={setSelectedAthleteId}
          />
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-gray-600">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Readiness Score"
          latest={readinessData?.latestScore}
          delta={readinessData?.delta7d}
          unit="%"
          target={85}
          onClick={() => navigate('/analytics/readiness')}
        />
        <MetricCard
          title="Sleep Duration"
          latest={sleepData?.avgHours}
          delta={sleepData?.delta7d}
          unit="h"
          target={8}
          onClick={() => navigate('/analytics/sleep')}
        />
        <MetricCard
          title="ACWR Ratio"
          latest={loadData?.latestAcwr}
          delta={loadData?.delta7d}
          target={1.3}
          onClick={() => navigate('/analytics/load')}
        />
        <MetricCard
          title="Latest Strain"
          latest={latestStrain?.value}
          delta={-2.1}
          target={15}
          onClick={() => navigate('/analytics/load')}
        />
      </div>

      {/* Mini Sparklines with Icons */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative">
          <div className="absolute top-3 left-3 z-10 p-1.5 bg-green-100 rounded-lg">
            <Activity className="w-4 h-4 text-green-600" />
          </div>
          <MiniSpark 
            data={readinessData?.series} 
            color="#10b981" 
            label={`Readiness Trend ${isHourlyView ? '(24h)' : ''}`} 
          />
        </div>
        <div className="relative">
          <div className="absolute top-3 left-3 z-10 p-1.5 bg-blue-100 rounded-lg">
            <Moon className="w-4 h-4 text-blue-600" />
          </div>
          <MiniSpark 
            data={sleepData?.series} 
            color="#3b82f6" 
            label={`Sleep Hours Trend ${isHourlyView ? '(24h)' : ''}`} 
          />
        </div>
        <div className="relative">
          <div className="absolute top-3 left-3 z-10 p-1.5 bg-purple-100 rounded-lg">
            <Dumbbell className="w-4 h-4 text-purple-600" />
          </div>
          <MiniSpark 
            data={loadData?.series} 
            color="#8b5cf6" 
            label={`Training Load Trend ${isHourlyView ? '(24h)' : ''}`} 
          />
        </div>
      </div>

      {/* Advanced Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Readiness Chart with Zones */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              <CardTitle className="text-lg">
                Readiness Score Analysis {isHourlyView && "(24h)"}
              </CardTitle>
            </div>
            <CardDescription>
              {isHourlyView ? "Hourly readiness with circadian patterns" : "Daily readiness with performance zones"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MetricChart
              type="line"
              data={readinessChartData}
              zones={readinessZones}
              xLabel={isHourlyView ? "Time" : "Date"}
              yLabel="Readiness Score"
              isHourlyView={isHourlyView}
            />
          </CardContent>
        </Card>

        {/* Sleep Composition Chart */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">
                Sleep Stage Analysis {isHourlyView && "(24h)"}
              </CardTitle>
            </div>
            <CardDescription>
              {isHourlyView ? "Hourly sleep pattern breakdown" : "Deep, light, and REM sleep breakdown"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MetricChart
              type="bar"
              data={sleepChartData}
              stacked={true}
              xLabel={isHourlyView ? "Time" : "Date"}
              yLabel="Hours"
              isHourlyView={isHourlyView}
            />
          </CardContent>
        </Card>

        {/* Training Load ACWR */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-lg">
                Training Load & ACWR {isHourlyView && "(24h)"}
              </CardTitle>
            </div>
            <CardDescription>
              {isHourlyView ? "Hourly training load patterns" : "Acute to chronic workload ratio analysis"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MetricChart
              type="line"
              data={loadChartData}
              zones={loadData?.zones}
              xLabel={isHourlyView ? "Time" : "Date"}
              yLabel="ACWR Ratio"
              isHourlyView={isHourlyView}
            />
          </CardContent>
        </Card>

        {/* Load Comparison Chart */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">
              Acute vs Chronic Load {isHourlyView && "(24h)"}
            </CardTitle>
            <CardDescription>
              {isHourlyView ? "Hourly vs cumulative training stress" : "Short-term vs long-term training stress comparison"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MetricChart
              type="bar"
              data={loadSecondaryData}
              multiSeries={true}
              xLabel={isHourlyView ? "Time" : "Date"}
              yLabel="Load"
              isHourlyView={isHourlyView}
            />
          </CardContent>
        </Card>
      </div>

      {/* Data Tables Section - Only show if not hourly view to avoid clutter */}
      {!isHourlyView && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Readiness Details</CardTitle>
              <CardDescription>Detailed readiness metrics and rolling averages</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  { header: 'Date', accessor: 'day', type: 'date' },
                  { header: 'Score', accessor: 'score', type: 'number' },
                  { header: '7d Avg', accessor: 'avg_7d', type: 'number' },
                  { header: '30d Avg', accessor: 'avg_30d', type: 'number' }
                ]}
                data={readinessData?.tableRows || []}
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Sleep Details</CardTitle>
              <CardDescription>Comprehensive sleep metrics and stage analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  { header: 'Date', accessor: 'day', type: 'date' },
                  { header: 'Duration', accessor: 'total_sleep_hours', type: 'number' },
                  { header: 'Avg HR', accessor: 'avg_hr', type: 'number' },
                  { header: 'Deep (min)', accessor: 'deep_minutes', type: 'number' },
                  { header: 'REM (min)', accessor: 'rem_minutes', type: 'number' }
                ]}
                data={sleepData?.tableRows || []}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ARIA Insights Section */}
      <Card className="shadow-sm border border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            AI Performance Insights {isHourlyView && "(24h View)"}
          </CardTitle>
          <CardDescription>
            {isHourlyView ? 
              "Real-time insights based on your hourly performance patterns" :
              "Personalized recommendations based on your performance data"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ARIAInsight metric="overview" period={period} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
