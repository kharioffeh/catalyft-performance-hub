
import { Link } from 'react-router-dom';
import {
  Gauge, CalendarDays, Activity, AlertTriangle, Menu
} from 'lucide-react';
import React from 'react';

export default function DashboardGlass() {
  /* ------------- mocked data ------------- */
  const readiness   = '--';
  const todayTotal  = 0;
  const weekDone    = 0;
  const weekPlanned = 0;
  /* --------------------------------------- */

  return (
    <div className="min-h-screen flex">
      {/* ─────────────  SIDEBAR  ───────────── */}
      <aside className="glass-panel w-[260px] hidden lg:flex flex-col">
        <div className="h-16 flex items-center justify-center text-2xl font-semibold">
          Catalyft
        </div>
        <nav className="flex-1 px-4 space-y-1 text-sm">
          <NavItem to="/dashboard" icon={<Gauge size={18}/>}>Dashboard</NavItem>
          <NavItem to="/analytics" icon={<Activity size={18}/>}>Analytics</NavItem>
          <NavItem to="/athletes" icon={<CalendarDays size={18}/>}>Athletes</NavItem>
          {/* … other links … */}
        </nav>
      </aside>

      {/* ─────────────  MAIN  ───────────── */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-[#0f172a] to-[#1e2b46]">
        {/* top ribbon */}
        <header className="glass-panel h-16 flex items-center justify-between px-6 sticky top-0 z-40">
          <button className="lg:hidden p-2"><Menu size={20}/></button>
          <span className="text-lg font-medium">Coach Dashboard</span>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-200">kwesi offeh</span>
            <button className="rounded-lg bg-white/10 px-3 py-1 text-sm hover:bg-white/20">Sign Out</button>
          </div>
        </header>

        {/* scrollable content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* metrics row */}
          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Metric title="Readiness"         value={readiness}   icon={<Activity/>}/>
            <Metric title="Today's Sessions" value={todayTotal} icon={<CalendarDays/>}/>
            <Metric title="This Week"        value={`${weekDone}/${weekPlanned}`} icon={<Gauge/>}/>
            <Metric title="Injury Risk"      value="--"          icon={<AlertTriangle/>}/>
          </section>

          {/* schedule */}
          <section className="glass-card p-6 min-h-[220px]">
            <h2 className="text-lg font-semibold mb-2">Today's Schedule</h2>
            <p className="text-center py-10 text-gray-400">No sessions scheduled for today</p>
          </section>

          {/* insights + risk */}
          <section className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-1">ARIA Insights</h3>
              <p className="text-gray-400 text-sm mb-6">AI-generated insights for today</p>
              <p className="text-center py-8 text-gray-400">No insights generated today</p>
            </div>
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-1">Injury Risk Forecast</h3>
              <p className="text-gray-400 text-sm mb-6">No forecast data available</p>
              <p className="text-center py-8 text-gray-400">Forecast will appear after sufficient data is collected</p>
            </div>
          </section>

          {/* quick actions */}
          <section className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <ActionBtn to="/analytics">Detailed Analytics</ActionBtn>
              <ActionBtn to="/calendar">Training Calendar</ActionBtn>
              <ActionBtn to="/athletes">Manage Athletes</ActionBtn>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */
function NavItem({to, icon, children}:{to:string;icon:JSX.Element;children:React.ReactNode}) {
  const isActive = window.location.pathname.startsWith(to);
  return (
    <Link to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 ${
        isActive ? 'bg-gradient-to-r from-indigo-500/30 to-indigo-500/20' : ''
      }`}>
      {icon}<span>{children}</span>
    </Link>
  );
}

function Metric({title,value,icon}:{title:string;value:string|number;icon:JSX.Element}) {
  return (
    <div className="glass-card p-6 flex flex-col">
      <div className="flex justify-between mb-4 text-indigo-200">{icon}</div>
      <p className="text-sm text-gray-300 mb-1">{title}</p>
      <p className="text-3xl font-semibold">{value}</p>
    </div>
  );
}

function ActionBtn({to,children}:{to:string;children:React.ReactNode}) {
  return (
    <Link to={to}
      className="glass-card text-center py-3 hover:bg-white/15 transition-colors">
      {children}
    </Link>
  );
}
