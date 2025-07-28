
import React from 'react';
import { DataTable } from '@/components/Analytics/DataTable';
import { ARIAInsight } from '@/components/Analytics/ARIAInsight';

interface TableViewProps {
  data: any;
  period: number;
  isLoading: boolean;
}

export const TableView: React.FC<TableViewProps> = ({ data, period, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Data Table: Daily Sleep Details */}
      <section className="card overflow-x-auto">
        <h2 className="text-lg font-semibold mb-2">Daily Sleep Details</h2>
        <p className="text-sm text-gray-600 mb-4">
          Detailed breakdown of daily sleep metrics and stages
        </p>
        <DataTable
          columns={[
            { header: "Date", accessor: "day", type: "date" },
            { header: "Total Hours", accessor: "total_sleep_hours", type: "number" },
            { header: "Avg HR", accessor: "avg_hr", type: "number" },
            { header: "Deep (min)", accessor: "deep_minutes", type: "number" },
            { header: "Light (min)", accessor: "light_minutes", type: "number" },
            { header: "REM (min)", accessor: "rem_minutes", type: "number" }
          ]}
          data={data.tableRows || []}
        />
      </section>

      {/* ARIA Insights */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-2">ARIA Sleep Insights</h2>
        <p className="text-sm text-gray-600 mb-4">
          AI-generated insights about your sleep patterns and quality
        </p>
        <ARIAInsight metric="sleep" period={period} />
      </section>
    </div>
  );
};
