
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Dumbbell, Sparkles, Users, Calendar, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { GenerateProgramDialog } from '@/components/GenerateProgramDialog';

const KAIPage: React.FC = () => {
  const { profile } = useAuth();
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  if (profile?.role !== 'coach') {
    return (
      <div className="text-center py-8">
        <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-500">Only coaches can access KAI program generation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">KAI</h1>
            <p className="text-gray-600">Kinetic Adaptive Instructor</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsGenerateOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4" />
          Generate Program
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              AI-Powered Program Generation
            </CardTitle>
            <CardDescription>
              Let KAI create personalized training programs based on athlete data and your coaching preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>Athlete-specific customization</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Flexible duration (4-12 weeks)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Target className="w-4 h-4" />
                <span>Focus-based programming</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How KAI Works</CardTitle>
            <CardDescription>
              KAI analyzes athlete data to create optimal training programs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Select Athlete</h4>
                  <p className="text-sm text-gray-600">Choose the athlete you want to create a program for</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Set Parameters</h4>
                  <p className="text-sm text-gray-600">Define program duration and training focus</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-medium">AI Generation</h4>
                  <p className="text-sm text-gray-600">KAI creates a personalized program automatically</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ready to Generate?</CardTitle>
          <CardDescription>
            Create a new training program with KAI's intelligent programming system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setIsGenerateOpen(true)}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Generate New Program with KAI
          </Button>
        </CardContent>
      </Card>

      <GenerateProgramDialog
        open={isGenerateOpen}
        onOpenChange={setIsGenerateOpen}
      />
    </div>
  );
};

export default KAIPage;
