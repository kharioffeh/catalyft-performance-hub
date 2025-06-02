
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
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
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

      // Add debugging for the current user
      console.log('InviteAthleteModal: Current session user:', {
        id: session.session.user.id,
        email: session.session.user.email,
        role: session.session.user.user_metadata?.role
      });

      // Let's also check if the profile exists before calling the function
      console.log('InviteAthleteModal: Checking profile in database...');
      const { data: profileCheck, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('id', session.session.user.id)
        .single();

      console.log('InviteAthleteModal: Profile check result:', { profileCheck, profileError });

      if (profileError || !profileCheck) {
        console.error('InviteAthleteModal: Profile not found in database');
        toast({
          title: "Error",
          description: "Your profile is not set up correctly. Please contact support.",
          variant: "destructive"
        });
        return;
      }

      if (profileCheck.role !== 'coach') {
        console.error('InviteAthleteModal: User is not a coach, role:', profileCheck.role);
        toast({
          title: "Error",
          description: `You are not registered as a coach. Your current role is: ${profileCheck.role}`,
          variant: "destructive"
        });
        return;
      }

      console.log('InviteAthleteModal: Session found, calling invite-athlete function');
      console.log('InviteAthleteModal: Function URL will be:', `https://xeugyryfvilanoiethum.supabase.co/functions/v1/invite-athlete`);

      const { data, error } = await supabase.functions.invoke('invite-athlete', {
        body: { email: email.trim().toLowerCase() },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });

      console.log('InviteAthleteModal: Function response:', { data, error });

      if (error) {
        console.error('InviteAthleteModal: Function error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to send invite",
          variant: "destructive"
        });
        return;
      }

      // Check if the function returned an error in the data
      if (data && data.error) {
        console.error('InviteAthleteModal: Function returned error:', data.error);
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      console.log('InviteAthleteModal: Invite sent successfully');
      toast({
        title: "Success",
        description: `Invite sent to ${email}`,
        variant: "default"
      });

      setEmail('');
      onClose();
      onSuccess?.();
      
    } catch (error) {
      console.error('InviteAthleteModal: Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
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
          <div className="flex gap-2">
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
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
