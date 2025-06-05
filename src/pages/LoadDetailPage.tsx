
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MetricChart } from '@/components/Analytics/MetricChart';
import { ARIAInsight } from '@/components/Analytics/ARIAInsight';
import { DataTable } from '@/components/Analytics/DataTable';
import { useMetricData } from '@/hooks/useMetricData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoadDetailPage() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const periodParam = Number(searchParams.get("period")) || 30;
  const [period, setPeriod] = useState<7 | 30 | 90>(
    periodParam === 7 ? 7 : periodParam === 90 ? 90 : 30
  );

  // Fetch detailed load data
  const { data, isLoading, error } = useMetricData("load", period);

  // Handler to change period and update URL
  const changePeriod = (p: 7 | 30 | 90) => {
    setPeriod(p);
    setSearchParams({ period: String(p) });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="text-center">
          <p className="text-gray-500">Unable to load training load data.</p>
          <p className="text-sm text-gray-400 mt-2">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Training Load Analysis</h1>
          <p className="text-gray-600">Detailed training load trends and ACWR monitoring</p>
        </div>
        
        {/* Period selector */}
        <div className="flex space-x-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              className={`px-3 py-1 rounded ${
                period === d ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => changePeriod(d as 7 | 30 | 90)}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Hero Chart: ACWR Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>ACWR (Acute:Chronic Workload Ratio)</CardTitle>
          <CardDescription>
            Track your training load ratio over the last {period} days with risk zones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MetricChart
            type="line"
            data={data.series || []}
            zones={data.zones}
            xLabel="Date"
            yLabel="ACWR"
          />
        </CardContent>
      </Card>

      {/* Secondary Chart: Acute vs Chronic Load */}
      {data.secondary && data.secondary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Acute vs Chronic Load</CardTitle>
            <CardDescription>
              Comparison of 7-day acute load vs 28-day chronic load
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MetricChart
              type="bar"
              data={data.secondary.map(point => ({ 
                x: point.x, 
                y: 0, 
                acute: point.acute, 
                chronic: point.chronic 
              }))}
              multiSeries={true}
              xLabel="Date"
              yLabel="Load"
            />
          </CardContent>
        </Card>
      )}

      {/* Data Table: Daily Load Details */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Load Details</CardTitle>
          <CardDescription>
            Detailed breakdown of daily training load and calculated metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { header: "Date", accessor: "day", type: "date" },
              { header: "Daily Load", accessor: "daily_load", type: "number" },
              { header: "Acute (7d)", accessor: "acute_7d", type: "number" },
              { header: "Chronic (28d)", accessor: "chronic_28d", type: "number" },
              { header: "ACWR", accessor: "acwr_7_28", type: "number" }
            ]}
            data={data.tableRows || []}
          />
        </CardContent>
      </Card>

      {/* ARIA Insights */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle>Coach ARIA Load Insights</CardTitle>
          <CardDescription>
            AI-generated insights about your training load and injury risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ARIAInsight metric="load" period={period} />
        </CardContent>
      </Card>
    </div>
  );
}
