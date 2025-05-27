
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
      const { data, error } = await supabase.functions.invoke('invite_athlete', {
        body: { email: email.trim(), name: name.trim() }
      });

      if (error) {
        console.error('Invite error:', error);
        throw error;
      }

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
