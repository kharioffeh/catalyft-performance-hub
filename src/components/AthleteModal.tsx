
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AthleteChart } from '@/components/AthleteChart';
import { AthleteSessionsTable } from '@/components/AthleteSessionsTable';
import { motion, AnimatePresence } from 'framer-motion';

interface AthleteModalProps {
  athleteId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isMobile: boolean;
}

interface AthleteData {
  id: string;
  name: string;
}

export const AthleteModal: React.FC<AthleteModalProps> = ({
  athleteId,
  open,
  onOpenChange,
  isMobile,
}) => {
  const [activeTab, setActiveTab] = useState('trends');

  const { data: athlete } = useQuery({
    queryKey: ['athlete', athleteId],
    queryFn: async () => {
      if (!athleteId) return null;
      
      const { data, error } = await supabase
        .from('athletes')
        .select('id, name')
        .eq('id', athleteId)
        .single();

      if (error) throw error;
      return data as AthleteData;
    },
    enabled: !!athleteId && open,
  });

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      x: isMobile ? 0 : '100%',
      y: isMobile ? '100%' : 0,
    },
    visible: { 
      opacity: 1, 
      x: 0,
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
      }
    },
    exit: { 
      opacity: 0, 
      x: isMobile ? 0 : '100%',
      y: isMobile ? '100%' : 0,
      transition: {
        duration: 0.2,
      }
    },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${
          isMobile 
            ? 'w-full h-full max-w-full max-h-full rounded-none' 
            : 'w-[90vw] max-w-4xl h-[90vh]'
        } overflow-hidden p-0`}
      >
        <AnimatePresence>
          {open && (
            <motion.div
              className="h-full flex flex-col"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <DialogHeader className="p-6 pb-0">
                <DialogTitle className="text-2xl">
                  {athlete?.name || 'Loading...'} - Risk Analysis
                </DialogTitle>
              </DialogHeader>
              
              <div className="flex-1 p-6 overflow-hidden">
                <Tabs 
                  value={activeTab} 
                  onValueChange={setActiveTab}
                  className="h-full flex flex-col"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="trends">7-Day Trends</TabsTrigger>
                    <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="trends" className="flex-1 mt-4">
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>Readiness & Load Trends</CardTitle>
                      </CardHeader>
                      <CardContent className="h-full">
                        {athleteId && (
                          <AthleteChart 
                            athleteId={athleteId} 
                            isVisible={activeTab === 'trends' && open}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="sessions" className="flex-1 mt-4">
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>Recent Sessions</CardTitle>
                      </CardHeader>
                      <CardContent className="h-full overflow-auto">
                        {athleteId && (
                          <AthleteSessionsTable athleteId={athleteId} />
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
