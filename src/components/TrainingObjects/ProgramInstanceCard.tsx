
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProgramInstanceCardProps {
  program: any;
}

export const ProgramInstanceCard: React.FC<ProgramInstanceCardProps> = ({
  program,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {program.template?.title || 'Program Instance'}
          </CardTitle>
          <Badge variant={program.status === 'active' ? 'default' : 'secondary'}>
            {program.status}
          </Badge>
        </div>
        <CardDescription>
          {program.template?.goal && (
            <>Goal: {program.template.goal} • </>
          )}
          {new Date(program.start_date).toLocaleDateString()} - {new Date(program.end_date).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Source</p>
            <p className="font-medium capitalize">{program.source}</p>
          </div>
          <div>
            <p className="text-gray-600">Created</p>
            <p className="font-medium">{new Date(program.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
