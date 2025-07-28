
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
      {/* Data Table: Daily Load Details */}
      <section className="card overflow-x-auto">
        <h2 className="text-lg font-display font-semibold mb-2">Daily Load Details</h2>
        <p className="text-sm text-gray-600 mb-4">
          Detailed breakdown of daily training load and calculated metrics
        </p>
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
      </section>

      {/* ARIA Insights */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-2">ARIA Load Insights</h2>
        <p className="text-sm text-gray-600 mb-4">
          AI-generated insights about your training load and injury risk
        </p>
        <ARIAInsight metric="load" period={period} />
      </section>
    </div>
  );
};
