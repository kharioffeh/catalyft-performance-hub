
import GlassCard from "@/components/ui/GlassCard";
import { Day } from "@/types/training";
import { Button } from "@/components/ui/button";
import { useScheduleDrawer } from "@/stores/drawers";
import { X, Clock, FileText } from "lucide-react";
import { format } from "date-fns";

export default function DayDetails({
  day,
  close,
}: {
  day: Day;
  close: () => void;
}) {
  const openDrawer = useScheduleDrawer((s) => s.open);

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case "strength":
        return "text-sky-400 bg-sky-400/10 border-sky-400/20";
      case "conditioning":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "recovery":
        return "text-pink-400 bg-pink-400/10 border-pink-400/20";
      case "technical":
        return "text-purple-400 bg-purple-400/10 border-purple-400/20";
      case "assessment":
        return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  return (
    <GlassCard className="p-4 md:p-6 shadow-xl" tone="glass">
      <header className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-white text-lg">{day.fullDate}</h4>
        <Button size="sm" variant="ghost" onClick={close} className="text-white/70 hover:text-white">
          <X className="h-4 w-4" />
        </Button>
      </header>

      {day.sessions.length > 0 ? (
        <div className="space-y-3 mb-4">
          {day.sessions.map((session) => (
            <div
              key={session.id}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 ${getSessionTypeColor(session.type)}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium capitalize">{session.type}</span>
                  <Clock className="h-3 w-3 opacity-60" />
                  <span className="text-xs opacity-80">
                    {format(new Date(session.start_time), 'HH:mm')} - {format(new Date(session.end_time), 'HH:mm')}
                  </span>
                </div>
                {session.notes && (
                  <div className="flex items-center gap-1 text-xs opacity-70">
                    <FileText className="h-3 w-3" />
                    <span>{session.notes}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/60 mb-4 text-center py-4">
          No sessions scheduled for this day
        </p>
      )}

      <Button
        className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white"
        onClick={() => {
          openDrawer({ date: day.date });
          close();
        }}
      >
        + Add Session
      </Button>
    </GlassCard>
  );
}
