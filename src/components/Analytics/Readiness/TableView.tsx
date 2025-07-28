
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
      {/* Data Table: Daily Readiness Details */}
      <section className="card overflow-x-auto">
        <h2 className="text-lg font-semibold mb-2">Daily Readiness Details</h2>
        <p className="text-sm text-gray-600 mb-4">
          Detailed breakdown of daily readiness scores and contributing metrics
        </p>
        <DataTable
          columns={[
            { header: "Date", accessor: "day", type: "date" },
            { header: "Readiness Score", accessor: "score", type: "number" },
            { header: "7-Day Average", accessor: "avg_7d", type: "number" },
            { header: "30-Day Average", accessor: "avg_30d", type: "number" }
          ]}
          data={data.tableRows || []}
        />
      </section>

      {/* ARIA Insights */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-2">ARIA Readiness Insights</h2>
        <p className="text-sm text-gray-600 mb-4">
          AI-generated insights about your readiness trends
        </p>
        <ARIAInsight metric="readiness" period={period} />
      </section>
    </div>
  );
};
