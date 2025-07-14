
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { inviteAthlete, type InviteAthleteData } from '@/lib/api/invite';

interface InviteAthleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  email: string;
  name: string;
  startDate: string;
}

export const InviteAthleteModal: React.FC<InviteAthleteModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    startDate: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [pendingInvite, setPendingInvite] = useState<{hasPendingInvite: boolean, inviteId?: string} | null>(null);
  const { toast } = useToast();

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent, resend = false) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('InviteAthleteModal: Starting invite process for:', formData);
      
      const inviteData: InviteAthleteData = {
        email: formData.email,
        name: formData.name || undefined,
        startDate: formData.startDate || undefined,
        resend: resend
      };

      const response = await inviteAthlete(inviteData);

      console.log('InviteAthleteModal: Invite response:', response);

      // Check if this is a pending invite scenario
      if (response.success === false && response.hasPendingInvite) {
        console.log('InviteAthleteModal: Pending invite found:', response);
        setPendingInvite({ 
          hasPendingInvite: response.hasPendingInvite, 
          inviteId: response.inviteId 
        });
        toast({
          title: "Pending Invite Found",
          description: response.error + " You can resend the invite if needed.",
          variant: "default"
        });
        return;
      }
      
      // Check for other error responses
      if (response.success === false) {
        console.log('InviteAthleteModal: Function returned error:', response);
        toast({
          title: "Error",
          description: response.error || "Failed to send invite",
          variant: "destructive"
        });
        return;
      }

      // Success case
      if (response.success === true || response.message) {
        console.log('InviteAthleteModal: Invite sent successfully');
        toast({
          title: "Success",
          description: response.message || `Invite ${resend ? 'resent' : 'sent'} to ${formData.email}`,
          variant: "default"
        });

        setFormData({ email: '', name: '', startDate: '' });
        setPendingInvite(null);
        onClose();
        onSuccess?.();
        return;
      }

      // Fallback for unexpected response structure
      console.log('InviteAthleteModal: Unexpected response structure:', response);
      toast({
        title: "Error",
        description: "Unexpected response from server",
        variant: "destructive"
      });
      
    } catch (error: any) {
      console.error('InviteAthleteModal: Unexpected error:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
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
    setFormData({ email: '', name: '', startDate: '' });
    setPendingInvite(null);
    onClose();
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Athlete</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Athlete Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              placeholder="athlete@example.com"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <Label htmlFor="name">Athlete Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange('name')}
              placeholder="John Doe"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="startDate">Training Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleInputChange('startDate')}
              min={today}
              disabled={isLoading}
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
