
import React, { useState, useEffect } from 'react';
import { create } from 'zustand';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';

interface LibraryStore {
  open: boolean;
  select: (exercise: any) => void;
  set: (state: Partial<LibraryStore>) => void;
}

export const useLibStore = create<LibraryStore>((set) => ({
  open: false,
  select: () => {},
  set: (state) => set(state)
}));

export function openLibrary(callback: (exercise: any) => void) {
  useLibStore.setState({ open: true, select: callback });
}

export default function LibraryDrawer() {
  const { open, select, set } = useLibStore();
  const [search, setSearch] = useState('');
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      supabase
        .from('exercises')
        .select('*')
        .ilike('name', `%${search}%`)
        .limit(50)
        .then(({ data }) => {
          setExercises(data || []);
          setLoading(false);
        });
    }
  }, [open, search]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
      <div className="bg-white w-80 h-full overflow-y-auto shadow-lg">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Exercise Library</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => set({ open: false })}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises..."
            className="w-full"
          />
        </div>

        <div className="p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : exercises.length > 0 ? (
            <ul className="space-y-1">
              {exercises.map((exercise) => (
                <li key={exercise.id}>
                  <Button
                    variant="ghost"
                    className="w-full text-left justify-start p-2 h-auto"
                    onClick={() => {
                      select(exercise);
                      set({ open: false });
                    }}
                  >
                    <div>
                      <div className="font-medium">{exercise.name}</div>
                      {exercise.description && (
                        <div className="text-xs text-gray-500 mt-1">
                          {exercise.description}
                        </div>
                      )}
                    </div>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No exercises found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
