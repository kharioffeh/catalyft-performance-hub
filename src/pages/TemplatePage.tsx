
import React from 'react';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import WeekSlider from '@/components/WeekSlider';

export default function TemplatePage() {
  const { id } = useParams<{ id: string }>();
  const [tpl, setTpl] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data } = await supabase
        .from('program_templates')
        .select('*')
        .eq('id', id)
        .single();
      setTpl(data);
    })();
  }, [id]);

  if (!tpl) return <p className="p-6">Loading…</p>;

  return (
    <div className="p-6">
      <nav className="text-sm mb-2">
        <a href="/training-plan" className="text-blue-600">Training Plan</a> &nbsp;›&nbsp; {tpl.name}
      </nav>
      <h1 className="text-2xl font-bold mb-4">{tpl.name}</h1>
      <WeekSlider blockJson={tpl.block_json} />
    </div>
  );
}
