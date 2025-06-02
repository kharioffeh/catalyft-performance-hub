
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface InviteAthleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const InviteAthleteModal: React.FC<InviteAthleteModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingInvite, setPendingInvite] = useState<{hasPendingInvite: boolean, inviteId?: string} | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent, resend = false) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('InviteAthleteModal: Starting invite process for email:', email);
      
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        console.error('InviteAthleteModal: No session found');
        toast({
          title: "Error",
          description: "You must be logged in to invite athletes",
          variant: "destructive"
        });
        return;
      }

      console.log('InviteAthleteModal: Session found, calling invite-athlete function');

      const { data, error } = await supabase.functions.invoke('invite-athlete', {
        body: { 
          email: email.trim().toLowerCase(),
          resend: resend
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });

      console.log('InviteAthleteModal: Function response:', { data, error });

      if (error) {
        console.error('InviteAthleteModal: Function error:', error);
        toast({
          title: "Error",
          description: "Failed to send invite. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Check if we have data and if it indicates success or failure
      if (data) {
        // Check if this is a pending invite scenario
        if (data.success === false && data.hasPendingInvite) {
          console.log('InviteAthleteModal: Pending invite found:', data);
          setPendingInvite({ 
            hasPendingInvite: data.hasPendingInvite, 
            inviteId: data.inviteId 
          });
          toast({
            title: "Pending Invite Found",
            description: data.error + " You can resend the invite if needed.",
            variant: "default"
          });
          return;
        }
        
        // Check for other error responses
        if (data.success === false) {
          console.log('InviteAthleteModal: Function returned error:', data);
          toast({
            title: "Error",
            description: data.error || "Failed to send invite",
            variant: "destructive"
          });
          return;
        }

        // Success case
        if (data.success === true || data.message) {
          console.log('InviteAthleteModal: Invite sent successfully');
          toast({
            title: "Success",
            description: data.message || `Invite ${resend ? 'resent' : 'sent'} to ${email}`,
            variant: "default"
          });

          setEmail('');
          setPendingInvite(null);
          onClose();
          onSuccess?.();
          return;
        }
      }

      // Fallback for unexpected response structure
      console.log('InviteAthleteModal: Unexpected response structure:', data);
      toast({
        title: "Error",
        description: "Unexpected response from server",
        variant: "destructive"
      });
      
    } catch (error) {
      console.error('InviteAthleteModal: Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = (e: React.FormEvent) => {
    setPendingInvite(null);
    handleSubmit(e, true);
  };

  const handleClose = () => {
    setEmail('');
    setPendingInvite(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Athlete</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Athlete Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="athlete@example.com"
              disabled={isLoading}
              required
            />
          </div>
          
          {pendingInvite?.hasPendingInvite && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800 mb-2">
                This athlete already has a pending invite. You can resend it if they haven't received it.
              </p>
            </div>
          )}
          
          <div className="flex gap-2">
            {pendingInvite?.hasPendingInvite ? (
              <>
                <Button 
                  type="button" 
                  onClick={handleResend}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Resending...' : 'Resend Invite'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Sending...' : 'Send Invite'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
