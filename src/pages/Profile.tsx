
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { GlassCard } from '@/components/ui';
import { User, Mail, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const Profile: React.FC = () => {
  const { profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
  });

  const handleSave = () => {
    // TODO: Implement profile update functionality
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      email: profile?.email || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Profile</h1>
        <p className="text-white/70">
          Manage your account information and preferences
        </p>
      </div>

      <GlassCard className="p-6 max-w-2xl">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-white flex items-center gap-3">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-white/10 text-white text-xl">
                {profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">Account Information</h2>
              <p className="text-white/70 font-normal capitalize">
                {profile?.role} Account
              </p>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="px-0 space-y-6">
          {/* Profile Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-white flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </Label>
              {isEditing ? (
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              ) : (
                <div className="p-3 bg-white/5 border border-white/10 rounded-md text-white">
                  {profile?.full_name || 'Not provided'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <div className="p-3 bg-white/5 border border-white/10 rounded-md text-white/70">
                {profile?.email}
                <span className="ml-2 text-xs">(Cannot be changed)</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Member Since
              </Label>
              <div className="p-3 bg-white/5 border border-white/10 rounded-md text-white/70">
                {profile?.created_at ? format(new Date(profile.created_at), 'MMMM dd, yyyy') : 'N/A'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Changes
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                Edit Profile
              </Button>
            )}
          </div>

          {/* Account Stats */}
          <div className="pt-6 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Account Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    Solo
                  </div>
                  <div className="text-sm text-white/70">Account Type</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">Active</div>
                  <div className="text-sm text-white/70">Status</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {profile?.created_at ? 
                      Math.floor((new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)) 
                      : 0
                    }
                  </div>
                  <div className="text-sm text-white/70">Days Active</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
};

export default Profile;
