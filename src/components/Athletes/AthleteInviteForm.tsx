
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface AthleteInviteFormProps {
  onInviteSent?: () => void;
}

export const AthleteInviteForm: React.FC<AthleteInviteFormProps> = ({ onInviteSent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !name.trim()) {
      toast({
        title: "Error",
        description: "Email and name are required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log('Sending invite to:', { email, name });

    try {
      // Get current session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      // Call the Edge Function directly with proper headers
      const response = await fetch(`https://xeugyryfvilanoiethum.supabase.co/functions/v1/invite_athlete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWd5cnlmdmlsYW5vaWV0aHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNjI4MTIsImV4cCI6MjA2MzgzODgxMn0.oVIVzYllVHBAZjaav7oLunGF5XDK8a5V37DhZKPh_Lk'
        },
        body: JSON.stringify({ email: email.trim(), name: name.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send invitation');
      }

      const data = await response.json();
      console.log('Invite response:', data);

      toast({
        title: "Success",
        description: "Invite sent successfully",
      });

      setEmail('');
      setName('');
      setIsOpen(false);
      onInviteSent?.();
    } catch (error: any) {
      console.error('Failed to send invite:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mail className="w-4 h-4 mr-2" />
          Invite Athlete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite New Athlete</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="athlete-name">Athlete Name *</Label>
            <Input
              id="athlete-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter athlete's full name"
              required
            />
          </div>
          <div>
            <Label htmlFor="athlete-email">Email Address *</Label>
            <Input
              id="athlete-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter athlete's email"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Invitation'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
