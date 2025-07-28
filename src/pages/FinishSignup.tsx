
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const FinishSignup: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    if (!session?.user) {
      toast({
        title: "Error",
        description: "No valid session found",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log('Completing solo signup:', { name, userId: session.user.id });

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: name.trim(),
          role: 'solo'
        })
        .eq('id', session.user.id);

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }

      console.log('Profile updated successfully');

      toast({
        title: "Welcome!",
        description: "Your profile has been completed successfully.",
      });

      navigate('/dashboard', { replace: true });

    } catch (error: any) {
      console.error('Signup completion error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete signup",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">Welcome! 🎉</CardTitle>
          <p className="text-gray-600">Finish setting up your profile to get started:</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full"
            />
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={!name.trim() || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Setting up...' : 'Enter app'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinishSignup;
