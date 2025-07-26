import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Trophy, X } from 'lucide-react';
import { Session } from '@/types/training';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ShareSessionModalProps {
  session: Session;
  visible: boolean;
  onClose: () => void;
}

export const ShareSessionModal: React.FC<ShareSessionModalProps> = ({
  session,
  visible,
  onClose
}) => {
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    if (!caption.trim() && !mediaUrl) {
      return;
    }

    setIsSharing(true);
    try {
      const { data, error } = await supabase.functions.invoke('createPost', {
        body: {
          session_id: session.id,
          caption: caption.trim() || null,
          media_url: mediaUrl
        }
      });

      if (error) throw error;

      toast({
        title: "Shared!",
        description: "Your session has been shared to the feed."
      });
      
      onClose();
    } catch (error) {
      console.error('Error sharing session:', error);
      toast({
        title: "Error",
        description: "Failed to share session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  const getPRBadges = () => {
    // This would check for PRs in the session data
    // For now, we'll return some mock data to demonstrate
    const mockPRs = [
      { exercise: 'Squat', value: '140kg', type: '1RM' },
      { exercise: 'Bench Press', value: '100kg', type: '1RM' }
    ];
    return mockPRs.length > 0 ? mockPRs : [];
  };

  const getSessionSummary = () => {
    if (!session.exercises || session.exercises.length === 0) {
      return [
        { name: 'Back Squat', sets: 5, reps: 5, weight: '135kg' },
        { name: 'Bench Press', sets: 4, reps: 8, weight: '95kg' },
        { name: 'Deadlift', sets: 3, reps: 3, weight: '160kg' }
      ];
    }

    return session.exercises.map(exercise => ({
      name: exercise.exercise_id, // This would be resolved to actual exercise name
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.load_kg ? `${exercise.load_kg}kg` : 'Bodyweight'
    }));
  };

  const sessionSummary = getSessionSummary();
  const prBadges = getPRBadges();

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="bg-brand-charcoal/95 backdrop-blur-md border border-white/10 max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-semibold text-white">
            Share Your Session
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Summary */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Session Summary</h3>
            <div className="space-y-3">
              {sessionSummary.map((exercise, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex-1">
                    <p className="text-white font-medium">{exercise.name}</p>
                    <p className="text-white/60 text-sm">
                      {exercise.sets} sets × {exercise.reps} reps @ {exercise.weight}
                    </p>
                  </div>
                  {prBadges.some(pr => pr.exercise === exercise.name) && (
                    <Badge className="bg-brand-blue/20 text-brand-blue border-brand-blue/30">
                      <Trophy className="w-3 h-3 mr-1" />
                      PR!
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {prBadges.length > 0 && (
              <div className="p-3 bg-brand-blue/10 border border-brand-blue/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-brand-blue" />
                  <span className="text-brand-blue font-semibold">Personal Records</span>
                </div>
                <div className="space-y-1">
                  {prBadges.map((pr, index) => (
                    <p key={index} className="text-white/80 text-sm">
                      {pr.exercise}: {pr.value} ({pr.type})
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Media Upload */}
          <div>
            <label className="text-white font-medium mb-2 block">Add Photo (Optional)</label>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-white/40 mx-auto mb-2" />
              <p className="text-white/60 text-sm">Upload a photo from your session</p>
              <p className="text-white/40 text-xs mt-1">Coming soon</p>
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="text-white font-medium mb-2 block">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption…"
              className="w-full h-24 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50"
              maxLength={300}
            />
            <p className="text-white/40 text-xs mt-1">{caption.length}/300</p>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Skip
          </Button>
          <Button
            onClick={handleShare}
            disabled={isSharing || (!caption.trim() && !mediaUrl)}
            className="bg-brand-blue text-brand-charcoal hover:bg-brand-blue/90 font-semibold"
          >
            {isSharing ? 'Sharing...' : 'Share to Feed'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};