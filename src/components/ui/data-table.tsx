
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface ColumnDef<T> {
  id?: string;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => any;
  header: string | React.ReactNode;
  cell?: ({ getValue, row }: { getValue: () => any; row: { original: T } }) => React.ReactNode;
  enableSorting?: boolean;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  className?: string;
  tableClassName?: string;
  stickyEndCols?: number;
  stickyHeader?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  className,
  tableClassName,
  stickyEndCols = 0,
  stickyHeader = false,
}: DataTableProps<T>) {
  return (
    <div className={cn('relative overflow-auto', className)}>
      <Table className={cn('relative', tableClassName)}>
        <TableHeader className={stickyHeader ? 'sticky top-0 z-10 bg-black/20 backdrop-blur-lg' : ''}>
          <TableRow className="border-white/10 hover:bg-transparent">
            {columns.map((column, index) => (
              <TableHead
                key={column.id || String(column.accessorKey) || index}
                className={cn(
                  'text-white/70 font-medium',
                  index >= columns.length - (stickyEndCols || 0) &&
                    'sticky right-0 bg-black/20 backdrop-blur-lg border-l border-white/10'
                )}
              >
                {typeof column.header === 'string' ? column.header : column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              className="border-white/10 hover:bg-white/5 transition-colors"
            >
              {columns.map((column, colIndex) => {
                const getValue = () => {
                  if (column.accessorFn) {
                    return column.accessorFn(row);
                  }
                  if (column.accessorKey) {
                    return row[column.accessorKey];
                  }
                  return null;
                };

                return (
                  <TableCell
                    key={column.id || String(column.accessorKey) || colIndex}
                    className={cn(
                      'text-white/90',
                      colIndex >= columns.length - (stickyEndCols || 0) &&
                        'sticky right-0 bg-black/20 backdrop-blur-lg border-l border-white/10'
                    )}
                  >
                    {column.cell ? column.cell({ getValue, row: { original: row } }) : getValue()}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
