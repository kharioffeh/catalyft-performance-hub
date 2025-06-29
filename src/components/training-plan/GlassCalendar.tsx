
import GlassCard from "@/components/ui/GlassCard";
import GlassDay from "./GlassDay";
import { Week } from "@/types/training";

type Props = { 
  weeks: Week[];
  className?: string;
};

export default function GlassCalendar({ weeks, className = "" }: Props) {
  return (
    <section className={`space-y-6 ${className}`}>
      {weeks.map((week) => (
        <div key={week.start} className="space-y-2">
          <h3 className="text-sm font-medium text-white/70 px-2">
            Week of {new Date(week.start).toLocaleDateString()}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 md:gap-3">
            {week.days.map((day) => (
              <GlassDay key={day.date} day={day} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
