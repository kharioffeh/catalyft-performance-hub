
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AssignedWorkoutsTabProps {
  assignedWorkouts: any[];
  isLoading: boolean;
}

export const AssignedWorkoutsTab: React.FC<AssignedWorkoutsTabProps> = ({
  assignedWorkouts,
  isLoading
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assigned Workouts</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : assignedWorkouts.length > 0 ? (
          <div className="space-y-4">
            {assignedWorkouts.map((workout) => (
              <Card key={workout.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{workout.template?.name}</h3>
                      <p className="text-sm text-gray-600">
                        Assigned: {new Date(workout.assigned_date).toLocaleDateString()}
                      </p>
                      {workout.due_date && (
                        <p className="text-sm text-gray-600">
                          Due: {new Date(workout.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        workout.status === 'completed' ? 'bg-green-100 text-green-800' :
                        workout.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        workout.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {workout.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No workouts assigned yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};
