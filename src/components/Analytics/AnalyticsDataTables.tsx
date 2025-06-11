
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from './DataTable';

interface AnalyticsDataTablesProps {
  readinessData: any;
  sleepData: any;
  isHourlyView: boolean;
}

export const AnalyticsDataTables: React.FC<AnalyticsDataTablesProps> = ({
  readinessData,
  sleepData,
  isHourlyView
}) => {
  if (isHourlyView) return null;

  return (
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
  );
};
