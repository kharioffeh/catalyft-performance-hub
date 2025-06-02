
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import EditableWeekTable from '@/components/EditableWeekTable';

export default function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [tpl, setTpl] = useState<any | null>(null);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch template once
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('program_templates')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        toast({
          title: "Error loading template",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setTpl(data);
      }
      setLoading(false);
    };

    fetchTemplate();
  }, [id]);

  const save = async () => {
    if (!tpl) return;
    
    setSaving(true);
    const { error } = await supabase
      .from('program_templates')
      .update({ 
        block_json: tpl.block_json,
        updated_at: new Date().toISOString()
      })
      .eq('id', tpl.id);
    
    if (error) {
      toast({
        title: "Error saving template",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Template saved",
        description: "Your changes have been saved successfully.",
      });
      setDirty(false);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tpl) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Template not found.</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/templates')}
          className="mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Templates
        </Button>
      </div>
    );
  }

  const isCoach = profile?.role === 'coach';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <nav className="text-sm mb-2">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/templates')}
          className="text-blue-600 hover:text-blue-800 p-0 h-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Templates
        </Button>
      </nav>
      
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{tpl.name}</h1>
        {isCoach && (
          <Button 
            disabled={!dirty || saving} 
            onClick={save}
            className="flex items-center gap-2"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </header>
      
      <EditableWeekTable
        blockJson={tpl.block_json}
        editable={isCoach}
        onChange={(blockJson) => {
          setTpl({ ...tpl, block_json: blockJson });
          setDirty(true);
        }}
      />
    </div>
  );
}
