
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
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">Program Templates</h3>
        <p className="text-sm text-white/60">Manage your training programs</p>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-white/10 hover:bg-white/5">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="text-white/70">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                  <TableHead className="text-white/70">Actions</TableHead>
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.id} className="border-white/10 hover:bg-white/5">
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="text-white/80">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      {row.original.origin === 'ARIA' && (
                        <Badge variant="destructive" className="bg-red-500/20 text-red-300 border-red-400/30">
                          ARIA suggested
                        </Badge>
                      )}
                      {row.original.origin === 'ARIA' && (
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => patchRow(row.original.id, { origin: 'ACCEPTED' })} 
                            size="sm"
                            className="bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-400/30"
                          >
                            Accept
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => patchRow(row.original.id, { origin: 'DECLINED' })} 
                            size="sm"
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-400/30"
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
