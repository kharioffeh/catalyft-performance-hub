import React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProgramTemplate } from '@/hooks/useProgramTemplates';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";

interface ProgramTableProps {
  data: ProgramTemplate[];
  patchRow: (id: string, values: Partial<ProgramTemplate>) => void;
}

const columns: ColumnDef<ProgramTemplate>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'origin',
    header: 'Origin',
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
  },
  {
    accessorKey: 'updated_at',
    header: 'Updated At',
  },
]

export const ProgramTable: React.FC<ProgramTableProps> = ({ data, patchRow }) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const rows = table.getRowModel().rows;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
              <td>
                {row.original.origin === 'ARIA' && (
                  <Badge variant="warning">ARIA suggested</Badge>
                )}
                {/* Accept/Decline logic */}
                {row.original.origin === 'ARIA' && (
                  <div className="flex gap-2 mt-1">
                    <Button onClick={() => patchRow(row.original.id, { origin: 'ACCEPTED' })} size="sm">Accept</Button>
                    <Button variant="outline" onClick={() => patchRow(row.original.id, { origin: 'DECLINED' })} size="sm">Decline</Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
