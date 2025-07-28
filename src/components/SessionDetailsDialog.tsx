
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
  user_uuid: string;
  type: string;
  start_ts: string;
  end_ts: string;
  notes?: string;
  user?: {
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
  canEdit = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSession, setEditedSession] = useState<Partial<Session>>({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (session) {
      setEditedSession({
        type: session.type,
        start_ts: session.start_ts,
        end_ts: session.end_ts,
        notes: session.notes || '',
      });
    }
  }, [session]);

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
    if (!session?.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('sessions')
        .update({
          type: editedSession.type,
          start_ts: editedSession.start_ts,
          end_ts: editedSession.end_ts,
          notes: editedSession.notes,
        })
        .eq('id', session.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setIsEditing(false);
      toast({
        title: "Session updated",
        description: "Your training session has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating session:', error);
      toast({
        title: "Error",
        description: "Failed to update session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!session?.id) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', session.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['sessions'] });
      onOpenChange(false);
      toast({
        title: "Session deleted",
        description: "Your training session has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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
                  disabled={isDeleting}
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
                <span className="font-medium">{session.user?.name}</span>
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
                  value={editedSession.type} 
                  onValueChange={(value) => setEditedSession(prev => ({ ...prev, type: value }))}
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
                  value={format(startDate, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    setEditedSession(prev => ({
                      ...prev,
                      start_ts: newDate.toISOString(),
                      end_ts: new Date(newDate.getTime() + (endDate.getTime() - startDate.getTime())).toISOString(),
                    }));
                  }}
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
                    value={format(startDate, 'HH:mm')}
                    onChange={(e) => {
                      const newDate = new Date(editedSession.start_ts || '');
                      newDate.setHours(parseInt(e.target.value.split(':')[0], 10));
                      newDate.setMinutes(parseInt(e.target.value.split(':')[1], 10));
                      setEditedSession(prev => ({
                        ...prev,
                        start_ts: newDate.toISOString(),
                      }));
                    }}
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
                    value={format(endDate, 'HH:mm')}
                    onChange={(e) => {
                      const newDate = new Date(editedSession.start_ts || '');
                      newDate.setHours(parseInt(e.target.value.split(':')[0], 10));
                      newDate.setMinutes(parseInt(e.target.value.split(':')[1], 10));
                      setEditedSession(prev => ({
                        ...prev,
                        end_ts: newDate.toISOString(),
                      }));
                    }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit_notes">Session Notes</Label>
                <Textarea
                  id="edit_notes"
                  value={editedSession.notes}
                  onChange={(e) => setEditedSession(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
