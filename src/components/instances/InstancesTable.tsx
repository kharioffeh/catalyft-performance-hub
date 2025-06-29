
import React from 'react';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { IconButton } from '@/components/ui/icon-button';
import { Badge } from '@/components/ui/badge';
import { Eye, Pencil, Archive } from 'lucide-react';
import { format } from 'date-fns';

export interface Instance {
  id: string;
  template_name: string;
  athlete_count: number;
  start: string;
  end: string;
  status: 'planned' | 'active' | 'completed';
}

const statusMap = {
  planned: { label: 'Planned', cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  active: { label: 'Active', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  completed: { label: 'Completed', cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

interface InstancesTableProps {
  data: Instance[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onArchive?: (id: string) => void;
}

export function InstancesTable({ data, onView, onEdit, onArchive }: InstancesTableProps) {
  const columns: ColumnDef<Instance>[] = [
    {
      accessorKey: 'template_name',
      header: 'Program',
      cell: ({ getValue }) => (
        <span className="font-medium text-white">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'athlete_count',
      header: 'Athletes',
      cell: ({ getValue }) => (
        <span className="text-white/80">{getValue() as number}</span>
      ),
    },
    {
      header: 'Start',
      accessorFn: (row) => format(new Date(row.start), 'dd MMM yy'),
      cell: ({ getValue }) => (
        <span className="text-white/80">{getValue() as string}</span>
      ),
    },
    {
      header: 'End',
      accessorFn: (row) => format(new Date(row.end), 'dd MMM yy'),
      cell: ({ getValue }) => (
        <span className="text-white/80">{getValue() as string}</span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ getValue }) => {
        const status = getValue() as Instance['status'];
        return (
          <Badge 
            className={`rounded-full px-3 py-1 text-xs border ${statusMap[status].cls}`}
            variant="outline"
          >
            {statusMap[status].label}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <IconButton
            icon={Eye}
            onClick={() => onView?.(row.original.id)}
            title="View program"
          />
          <IconButton
            icon={Pencil}
            onClick={() => onEdit?.(row.original.id)}
            title="Edit program"
          />
          <IconButton
            icon={Archive}
            variant="destructive"
            onClick={() => onArchive?.(row.original.id)}
            title="Archive program"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="relative">
      <DataTable
        columns={columns}
        data={data}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg"
        tableClassName="min-w-[880px]"
        stickyEndCols={1}
        stickyHeader
      />
      {/* Mobile scroll hint */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-black/80 to-transparent sm:hidden" />
    </div>
  );
}
