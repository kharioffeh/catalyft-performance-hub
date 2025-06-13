import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
export const RiskBoardHeader: React.FC = () => {
  return <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Risk Board</h1>
        <p className="mt-2 text-slate-50">
          Monitor athlete injury risk and recovery status
        </p>
      </div>
      <div className="flex space-x-2">
        <Badge variant="outline" className="bg-red-50 text-red-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          High Risk
        </Badge>
        <Badge variant="outline" className="bg-amber-50 text-amber-800">
          <TrendingDown className="w-3 h-3 mr-1" />
          Medium Risk
        </Badge>
        <Badge variant="outline" className="bg-green-50 text-green-800">
          <TrendingUp className="w-3 h-3 mr-1" />
          Low Risk
        </Badge>
      </div>
    </div>;
};