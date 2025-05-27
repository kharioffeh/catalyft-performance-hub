
import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
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
import { RiskBoardTableStates } from './RiskBoard/components/RiskBoardTableStates';
import { createRiskBoardColumns } from './RiskBoard/config/tableColumns';

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

  const columns = createRiskBoardColumns({ onAthleteClick, isMobile });

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

  const tableStates = (
    <RiskBoardTableStates isLoading={isLoading} hasData={data.length > 0} />
  );

  if (isLoading || data.length === 0) {
    return tableStates;
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
