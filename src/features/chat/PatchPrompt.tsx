import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Activity, Loader2 } from 'lucide-react';
import { ProgramPatch } from '@/types/programPatch';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PatchPromptProps {
  patch: ProgramPatch;
  onAccept: () => void;
  onDecline: () => void;
  isVisible: boolean;
}

export const PatchPrompt: React.FC<PatchPromptProps> = ({
  patch,
  onAccept,
  onDecline,
  isVisible
}) => {
  const [isApplying, setIsApplying] = useState(false);

  const handleAccept = async () => {
    setIsApplying(true);
    
    try {
      const { error } = await supabase.functions.invoke('apply-patch', {
        body: { payload: patch }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Program adjustments applied successfully",
        variant: "default"
      });

      onAccept();
    } catch (error: any) {
      console.error('Error applying patch:', error);
      
      toast({
        title: "Error",
        description: error?.message || "Failed to apply program adjustments",
        variant: "destructive"
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <Card className="bg-background/95 backdrop-blur-md border border-border/50 shadow-2xl">
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">
                  Apply adjustments?
                </h3>
              </div>

              {/* Patch Details */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  ARIA suggests adjustments to your program:
                </p>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {patch.name}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      {patch.total_weeks} weeks
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {patch.mesocycles.length} mesocycles
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDecline}
                  disabled={isApplying}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Decline
                </Button>
                
                <Button
                  size="sm"
                  onClick={handleAccept}
                  disabled={isApplying}
                  className="flex-1"
                >
                  {isApplying ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  )}
                  {isApplying ? 'Applying...' : 'Accept'}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};