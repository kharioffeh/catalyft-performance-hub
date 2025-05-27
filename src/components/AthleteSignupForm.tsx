
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface AthleteSignupFormProps {
  email: string;
  userId: string;
}

export const AthleteSignupForm: React.FC<AthleteSignupFormProps> = ({ email, userId }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log('Completing athlete signup:', { name, dob, userId });

    try {
      // Update the user's profile with their information and set role to athlete
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          full_name: name.trim(),
          role: 'athlete'
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      console.log('Profile updated successfully');

      // If date of birth is provided, we could store it in a separate athletes table
      // For now, we'll just complete the signup process

      toast({
        title: "Welcome!",
        description: "Your account has been set up successfully.",
      });

      // Navigate to athlete dashboard
      navigate('/dashboard');

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          disabled
          className="bg-gray-50"
        />
      </div>
      
      <div>
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="dob">Date of Birth (Optional)</Label>
        <Input
          id="dob"
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
        />
      </div>
      
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Completing Signup...' : 'Complete Signup'}
      </Button>
    </form>
  );
};
