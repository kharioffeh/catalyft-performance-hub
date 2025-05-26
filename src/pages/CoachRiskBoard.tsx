
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CoachRiskBoard: React.FC = () => {
  const { profile } = useAuth();

  const { data: athletes } = useQuery({
    queryKey: ['coach-athletes', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      // Get athletes for this coach with their latest readiness scores
      const { data, error } = await supabase
        .from('athletes')
        .select(`
          id,
          name,
          readiness_scores!inner(score, ts)
        `)
        .eq('coach_uuid', profile.id)
        .order('readiness_scores.ts', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id && profile?.role === 'coach'
  });

  const getRiskLevel = (readiness: number) => {
    if (readiness >= 80) return { label: 'Low', color: 'bg-green-100 text-green-800' };
    if (readiness >= 60) return { label: 'Medium', color: 'bg-amber-100 text-amber-800' };
    return { label: 'High', color: 'bg-red-100 text-red-800' };
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Risk Board</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Athlete Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Athlete</TableHead>
                  <TableHead>Readiness</TableHead>
                  <TableHead>ACWR</TableHead>
                  <TableHead>Yesterday HSR</TableHead>
                  <TableHead>Risk Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {athletes?.map((athlete) => {
                  const latestReadiness = athlete.readiness_scores?.[0]?.score || 0;
                  const risk = getRiskLevel(latestReadiness);
                  
                  return (
                    <TableRow 
                      key={athlete.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => console.log('Open athlete modal:', athlete.id)}
                    >
                      <TableCell className="font-medium">{athlete.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{Math.round(latestReadiness)}%</span>
                          <div className={`w-2 h-2 rounded-full ${
                            latestReadiness >= 80 ? 'bg-green-500' :
                            latestReadiness >= 60 ? 'bg-amber-500' : 'bg-red-500'
                          }`} />
                        </div>
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        <Badge className={risk.color}>
                          {risk.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {(!athletes || athletes.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No athletes found. Add athletes to see their risk assessment.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CoachRiskBoard;
