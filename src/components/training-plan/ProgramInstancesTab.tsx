
import React from 'react';
import { InstancesTable, Instance } from '@/components/instances/InstancesTable';
import { useProgramInstances } from '@/hooks/useProgramInstances';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const ProgramInstancesTab: React.FC = () => {
  const { data: instances = [], isLoading, error } = useProgramInstances();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleView = (id: string) => {
    navigate(`/program-instance/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/program-instance/${id}/edit`);
  };

  const handleArchive = (id: string) => {
    // TODO: Implement archive functionality
    toast({
      title: "Archive Program",
      description: "Archive functionality coming soon",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-32 bg-white/10" />
                  <Skeleton className="h-4 w-16 bg-white/10" />
                  <Skeleton className="h-4 w-20 bg-white/10" />
                  <Skeleton className="h-4 w-20 bg-white/10" />
                  <Skeleton className="h-6 w-20 bg-white/10 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 bg-white/10 rounded-lg" />
                  <Skeleton className="h-8 w-8 bg-white/10 rounded-lg" />
                  <Skeleton className="h-8 w-8 bg-white/10 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-2">Error loading program instances</div>
        <p className="text-white/60">Please try refreshing the page</p>
      </div>
    );
  }

  // Transform program instances to match our Instance interface
  const transformedInstances: Instance[] = instances.map((instance) => ({
    id: instance.id,
    template_name: instance.template?.title || 'Untitled Program',
    athlete_count: 1, // TODO: Calculate actual athlete count
    start: instance.start_date,
    end: instance.end_date,
    status: instance.status as Instance['status'],
  }));

  if (transformedInstances.length === 0) {
    return (
      <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white/40" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
            <polyline points="14,2 14,8 20,8" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No Program Instances</h3>
        <p className="text-white/60">
          Program instances will appear here when athletes are assigned to programs
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">Program Instances</h3>
        <p className="text-white/60">Active and scheduled program assignments</p>
      </div>

      <InstancesTable
        data={transformedInstances}
        onView={handleView}
        onEdit={handleEdit}
        onArchive={handleArchive}
      />
    </div>
  );
};
