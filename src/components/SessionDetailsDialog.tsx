
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { QueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Calendar, Clock, User, Dumbbell, Edit, Trash2, Save, X } from 'lucide-react';
import { format } from 'date-fns';

interface Session {
  id: string;
  athlete_uuid: string;
  coach_uuid: string;
  type: string;
  start_ts: string;
  end_ts: string;
  notes?: string;
  athletes?: {
    name: string;
  };
}

interface SessionDetailsDialogProps {
  session: Session | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queryClient: QueryClient;
  canEdit?: boolean;
}

export const SessionDetailsDialog: React.FC<SessionDetailsDialogProps> = ({
  session,
  open,
  onOpenChange,
  queryClient,
  canEdit = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    type: '',
    date: '',
    start_time: '',
    end_time: '',
    notes: '',
  });

  React.useEffect(() => {
    if (session && isEditing) {
      const startDate = new Date(session.start_ts);
      const endDate = new Date(session.end_ts);
      
      setEditData({
        type: session.type,
        date: format(startDate, 'yyyy-MM-dd'),
        start_time: format(startDate, 'HH:mm'),
        end_time: format(endDate, 'HH:mm'),
        notes: session.notes || '',
      });
    }
  }, [session, isEditing]);

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'strength':
        return 'bg-green-100 text-green-800';
      case 'technical':
        return 'bg-blue-100 text-blue-800';
      case 'recovery':
        return 'bg-yellow-100 text-yellow-800';
      case 'conditioning':
        return 'bg-purple-100 text-purple-800';
      case 'assessment':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSave = async () => {
    if (!session) return;

    setLoading(true);
    try {
      const startDateTime = new Date(`${editData.date}T${editData.start_time}`);
      const endDateTime = new Date(`${editData.date}T${editData.end_time}`);

      if (endDateTime <= startDateTime) {
        toast({
          title: "Error",
          description: "End time must be after start time",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('sessions')
        .update({
          type: editData.type,
          start_ts: startDateTime.toISOString(),
          end_ts: endDateTime.toISOString(),
          notes: editData.notes || null,
        })
        .eq('id', session.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session updated successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating session:', error);
      toast({
        title: "Error",
        description: "Failed to update session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!session) return;

    const confirmed = window.confirm('Are you sure you want to delete this session?');
    if (!confirmed) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', session.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  const startDate = new Date(session.start_ts);
  const endDate = new Date(session.end_ts);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Session Details
            </div>
            {canEdit && !isEditing && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {!isEditing ? (
            // View Mode
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{session.athletes?.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-gray-500" />
                <Badge className={getSessionTypeColor(session.type)}>
                  {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{format(startDate, 'EEEE, MMMM do, yyyy')}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>
                  {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                </span>
              </div>

              {session.notes && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Notes</Label>
                    <p className="mt-1 text-sm text-gray-600">{session.notes}</p>
                  </div>
                </>
              )}
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_type" className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4" />
                  Session Type
                </Label>
                <Select 
                  value={editData.type} 
                  onValueChange={(value) => setEditData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">Strength Training</SelectItem>
                    <SelectItem value="technical">Technical Training</SelectItem>
                    <SelectItem value="recovery">Recovery Session</SelectItem>
                    <SelectItem value="conditioning">Conditioning</SelectItem>
                    <SelectItem value="assessment">Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit_date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </Label>
                <Input
                  id="edit_date"
                  type="date"
                  value={editData.date}
                  onChange={(e) => setEditData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_start_time" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Start Time
                  </Label>
                  <Input
                    id="edit_start_time"
                    type="time"
                    value={editData.start_time}
                    onChange={(e) => setEditData(prev => ({ ...prev, start_time: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_end_time" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    End Time
                  </Label>
                  <Input
                    id="edit_end_time"
                    type="time"
                    value={editData.end_time}
                    onChange={(e) => setEditData(prev => ({ ...prev, end_time: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit_notes">Session Notes</Label>
                <Textarea
                  id="edit_notes"
                  value={editData.notes}
                  onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
