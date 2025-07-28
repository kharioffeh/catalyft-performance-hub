import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Trophy, Search, Filter, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProgramInstances } from '@/hooks/useProgramInstances';
import { ProgramInstance } from '@/types/training';
import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

const InstancesScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'archived'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'thisWeek' | 'thisMonth' | 'lastMonth'>('all');
  
  const { data: instances = [], loading, error } = useProgramInstances();

  // Filter instances based on search and filters
  const filteredInstances = instances.filter((instance: ProgramInstance) => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      instance.template?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instance.template?.goal?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === 'all' || instance.status === statusFilter;

    // Date filter
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const instanceDate = new Date(instance.end_date);
      const now = new Date();
      
      switch (dateFilter) {
        case 'thisWeek':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = isAfter(instanceDate, weekAgo);
          break;
        case 'thisMonth':
          const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
          matchesDate = isAfter(instanceDate, monthAgo);
          break;
        case 'lastMonth':
          const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
          matchesDate = isAfter(instanceDate, lastMonthStart) && isBefore(instanceDate, lastMonthEnd);
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'archived':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'active':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getGoalIcon = (goal: string) => {
    switch (goal) {
      case 'strength':
        return <Trophy className="w-4 h-4" />;
      case 'power':
        return <Trophy className="w-4 h-4" />;
      case 'hypertrophy':
        return <Trophy className="w-4 h-4" />;
      case 'endurance':
        return <Clock className="w-4 h-4" />;
      default:
        return <Trophy className="w-4 h-4" />;
    }
  };

  const generateSummary = (instance: ProgramInstance) => {
    const startDate = format(new Date(instance.start_date), 'MMM d');
    const endDate = format(new Date(instance.end_date), 'MMM d, yyyy');
    const duration = Math.ceil((new Date(instance.end_date).getTime() - new Date(instance.start_date).getTime()) / (1000 * 60 * 60 * 24 * 7));
    
    return `${duration} week program • ${startDate} - ${endDate}`;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Program History</h1>
        </div>
        
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Program History</h1>
        </div>
        <div className="text-center py-8 text-red-600">
          Error loading program instances: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Program History</h1>
        </div>
        <Badge variant="secondary" className="text-sm">
          {filteredInstances.length} program{filteredInstances.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">Status:</span>
            </div>
            {(['all', 'completed', 'archived'] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">Period:</span>
            </div>
            {(['all', 'thisWeek', 'thisMonth', 'lastMonth'] as const).map((period) => (
              <Button
                key={period}
                variant={dateFilter === period ? "default" : "outline"}
                size="sm"
                onClick={() => setDateFilter(period)}
                className="capitalize"
              >
                {period === 'thisWeek' ? 'This Week' :
                 period === 'thisMonth' ? 'This Month' :
                 period === 'lastMonth' ? 'Last Month' : 'All Time'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Program Instance Cards */}
      {filteredInstances.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
          {filteredInstances.map((instance: ProgramInstance) => (
            <Card 
              key={instance.id} 
              className="group cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg border"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg leading-tight mb-2">
                      {instance.template?.title || 'Untitled Program'}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-xs border", getStatusColor(instance.status))}>
                        {instance.status}
                      </Badge>
                      {instance.template?.goal && (
                        <Badge variant="outline" className="text-xs capitalize">
                          <div className="flex items-center gap-1">
                            {getGoalIcon(instance.template.goal)}
                            {instance.template.goal}
                          </div>
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* Summary */}
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {generateSummary(instance)}
                  </p>

                  {/* Date completed */}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Completed {format(new Date(instance.end_date), 'MMMM d, yyyy')}
                    </span>
                  </div>

                  {/* Source */}
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        instance.source === 'aria' 
                          ? 'border-purple-200 text-purple-600' 
                          : 'border-blue-200 text-blue-600'
                      )}
                    >
                      {instance.source === 'aria' ? 'ARIA Generated' : 'Template Based'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No program instances found
            </h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Complete your first program to see it here'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InstancesScreen;