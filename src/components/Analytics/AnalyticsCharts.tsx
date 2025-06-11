
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricChart } from './MetricChart';
import { Activity, Moon, Dumbbell } from 'lucide-react';

interface AnalyticsChartsProps {
  readinessChartData: any[];
  sleepChartData: any[];
  loadChartData: any[];
  loadSecondaryData: any[];
  readinessZones: any[];
  loadZones: any[];
  isHourlyView: boolean;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  readinessChartData,
  sleepChartData,
  loadChartData,
  loadSecondaryData,
  readinessZones,
  loadZones,
  isHourlyView
}) => {
  return (
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
            zones={loadZones}
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
  );
};
