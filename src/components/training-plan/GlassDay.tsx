
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import DayDetails from "./DayDetails";
import { useState } from "react";
import { Day } from "@/types/training";

export default function GlassDay({ day }: { day: Day }) {
  const [open, setOpen] = useState(false);

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case "strength":
        return "bg-sky-400";
      case "conditioning":
        return "bg-emerald-400";
      case "recovery":
        return "bg-pink-400";
      case "technical":
        return "bg-purple-400";
      case "assessment":
        return "bg-amber-400";
      default:
        return "bg-gray-400/60";
    }
  };

  const isToday = new Date().toDateString() === new Date(day.date).toDateString();

  return (
    <div className="relative">
      <GlassCard
        onClick={() => setOpen((o) => !o)}
        className={`cursor-pointer group p-3 md:p-4 text-center hover:scale-105 transition-transform ${
          isToday ? 'ring-2 ring-white/20' : ''
        }`}
        accent={isToday ? 'primary' : undefined}
      >
        <p className="text-xs md:text-sm font-medium text-white">{day.weekday}</p>
        <p className="text-lg md:text-xl font-bold text-white mb-2">{day.dateLabel}</p>

        {/* Session dots */}
        <div className="flex justify-center gap-1 flex-wrap">
          {day.sessions.slice(0, 4).map((session, index) => (
            <span
              key={session.id}
              className={`h-2 w-2 rounded-full ${getSessionTypeColor(session.type)}`}
              title={session.title}
            />
          ))}
          {day.sessions.length > 4 && (
            <span className="text-xs text-white/60">+{day.sessions.length - 4}</span>
          )}
        </div>

        {day.sessions.length === 0 && (
          <div className="h-2 flex justify-center">
            <span className="h-1 w-1 rounded-full bg-white/20" />
          </div>
        )}
      </GlassCard>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute top-full left-0 right-0 z-50 mt-1"
          >
            <DayDetails day={day} close={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
