
import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingDown, TrendingUp, ArrowUpDown } from 'lucide-react';

interface RiskBoardData {
  athlete_id: string;
  name: string;
  readiness: number;
  acwr: number;
  yesterday_hsr: number;
  flag: 'red' | 'amber' | 'green';
}

interface RiskBoardTableProps {
  data: RiskBoardData[];
  isLoading: boolean;
  onAthleteClick: (athleteId: string) => void;
  isMobile: boolean;
}

const columnHelper = createColumnHelper<RiskBoardData>();

export const RiskBoardTable: React.FC<RiskBoardTableProps> = ({
  data,
  isLoading,
  onAthleteClick,
  isMobile,
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'flag', desc: true },
    { id: 'readiness', desc: false },
  ]);

  const getFlagIcon = (flag: string) => {
    switch (flag) {
      case 'red':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'amber':
        return <TrendingDown className="w-4 h-4 text-amber-600" />;
      case 'green':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      default:
        return null;
    }
  };

  const getFlagBadgeColor = (flag: string) => {
    switch (flag) {
      case 'red':
        return 'bg-red-100 text-red-800';
      case 'amber':
        return 'bg-amber-100 text-amber-800';
      case 'green':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReadinessBadgeColor = (readiness: number) => {
    if (readiness >= 80) return 'bg-green-100 text-green-800';
    if (readiness >= 60) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  const columns = [
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
      cell: ({ getValue, row }) => {
        const flag = getValue();
        return (
          <div className="flex items-center justify-center">
            {isMobile ? (
              <div className="flex flex-col items-center space-y-1">
                {getFlagIcon(flag)}
                <Badge className={getFlagBadgeColor(flag)} variant="outline">
                  {flag.charAt(0).toUpperCase() + flag.slice(1)}
                </Badge>
              </div>
            ) : (
              <Badge className={getFlagBadgeColor(flag)}>
                {getFlagIcon(flag)}
                <span className="ml-1">{flag.charAt(0).toUpperCase() + flag.slice(1)}</span>
              </Badge>
            )}
          </div>
        );
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

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading risk assessment...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No athletes found. Add athletes to see their risk assessment.
      </div>
    );
  }

  return (
    <div className={isMobile ? 'overflow-x-auto' : ''}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-center">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onAthleteClick(row.original.athlete_id)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="text-center">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
