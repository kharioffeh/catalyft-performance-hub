
import React from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import { Reorder } from 'framer-motion';
import SessionCard from './SessionCard';

interface Session {
  id: string;
  sessionName: string;
  exercises: any[];
}

interface Week {
  sessions: Session[];
}

interface WeekAccordionProps {
  week: Week;
  weekIdx: number;
  onChange: (week: Week) => void;
}

export default function WeekAccordion({ week, weekIdx, onChange }: WeekAccordionProps) {
  const addSession = () => {
    const newSession = {
      id: `session-${Date.now()}-${Math.random()}`,
      sessionName: 'New Session',
      exercises: []
    };
    onChange({
      ...week,
      sessions: [...week.sessions, newSession]
    });
  };

  const updateSession = (sessionIndex: number, newSession: Session) => {
    const clone = { ...week };
    clone.sessions[sessionIndex] = newSession;
    onChange(clone);
  };

  return (
    <div className="border rounded-lg mb-4">
      <Disclosure defaultOpen={weekIdx === 0}>
        {({ open }) => (
          <>
            <Disclosure.Button className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 transition-colors">
              <span className="text-lg font-medium">Week {weekIdx + 1}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {week.sessions.length} session{week.sessions.length !== 1 ? 's' : ''}
                </span>
                <ChevronDown 
                  className={`w-5 h-5 transition-transform duration-200 ${
                    open ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </div>
            </Disclosure.Button>
            <Disclosure.Panel className="px-4 pb-4 space-y-3">
              {week.sessions.length > 0 && (
                <Reorder.Group 
                  axis="y" 
                  values={week.sessions} 
                  onReorder={(reorderedSessions) => onChange({ ...week, sessions: reorderedSessions })}
                  className="space-y-3"
                >
                  {week.sessions.map((session, idx) => (
                    <SessionCard 
                      key={session.id}
                      value={session}
                      onChange={(newSession) => updateSession(idx, newSession)}
                    />
                  ))}
                </Reorder.Group>
              )}
              <button
                onClick={addSession}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-gray-600 hover:text-gray-800"
              >
                + Add Session
              </button>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
}
