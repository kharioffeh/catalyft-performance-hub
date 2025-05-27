
import React from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown } from 'lucide-react';
import { RiskFlagCell } from '../components/RiskFlagCell';
import { getReadinessBadgeColor } from '../utils/riskBoardStyles';

interface RiskBoardData {
  athlete_id: string;
  name: string;
  readiness: number;
  acwr: number;
  yesterday_hsr: number;
  flag: 'red' | 'amber' | 'green';
}

interface CreateColumnsProps {
  onAthleteClick: (athleteId: string) => void;
  isMobile: boolean;
}

const columnHelper = createColumnHelper<RiskBoardData>();

export const createRiskBoardColumns = ({ onAthleteClick, isMobile }: CreateColumnsProps) => [
  columnHelper.accessor('name', {
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-auto p-0 font-medium"
      >
        Athlete
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => (
      <div className="font-medium">{getValue()}</div>
    ),
  }),
  columnHelper.accessor('readiness', {
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-auto p-0 font-medium"
      >
        Readiness
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => {
      const readiness = getValue();
      return (
        <Badge className={getReadinessBadgeColor(readiness)}>
          {Math.round(readiness)}%
        </Badge>
      );
    },
  }),
  columnHelper.accessor('acwr', {
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-auto p-0 font-medium"
      >
        ACWR
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => {
      const acwr = getValue();
      return (
        <div className="text-center">
          {acwr ? acwr.toFixed(2) : 'N/A'}
        </div>
      );
    },
  }),
  columnHelper.accessor('yesterday_hsr', {
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-auto p-0 font-medium"
      >
        Yesterday HSR
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => {
      const hsr = getValue();
      return (
        <div className="text-center">
          {hsr ? `${Math.round(hsr)}m` : 'N/A'}
        </div>
      );
    },
  }),
  columnHelper.accessor('flag', {
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-auto p-0 font-medium"
      >
        Risk Level
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => {
      const flag = getValue();
      return <RiskFlagCell flag={flag} isMobile={isMobile} />;
    },
    sortingFn: (rowA, rowB) => {
      const flagOrder = { red: 3, amber: 2, green: 1 };
      return flagOrder[rowA.original.flag] - flagOrder[rowB.original.flag];
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAthleteClick(row.original.athlete_id)}
      >
        View Details
      </Button>
    ),
  }),
];
