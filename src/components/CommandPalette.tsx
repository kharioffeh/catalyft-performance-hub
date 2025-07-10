
import React from 'react';
import {
  KBarProvider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  KBarResults,
  useMatches,
} from 'kbar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  MessageSquare, 
  Settings,
  Activity,
  BookOpen,
  AlertTriangle,
  Moon,
  Sun,
  UserPlus,
  LogOut
} from 'lucide-react';

interface CommandPaletteProps {
  children: React.ReactNode;
}

const RenderResults = () => {
  const { results } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === "string" ? (
          <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-white/60 uppercase tracking-wider border-b border-white/10 dark:border-white/20">
            {item}
          </div>
        ) : (
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-3 text-sm cursor-pointer transition-colors rounded-lg mx-2",
              active
                ? "bg-glass-card-light/40 dark:bg-glass-card-dark/50 text-gray-900 dark:text-white"
                : "text-gray-700 dark:text-white/80 hover:bg-glass-card-light/20 dark:hover:bg-glass-card-dark/30"
            )}
          >
            {item.icon && (
              <div className="flex items-center justify-center w-5 h-5">
                {item.icon}
              </div>
            )}
            <div className="flex flex-col">
              <div className="font-medium">{item.name}</div>
              {item.subtitle && (
                <div className="text-xs text-gray-500 dark:text-white/60">
                  {item.subtitle}
                </div>
              )}
            </div>
            {item.shortcut?.length && (
              <div className="ml-auto flex gap-1">
                {item.shortcut.map((sc) => (
                  <kbd
                    key={sc}
                    className="px-2 py-1 text-xs bg-white/10 dark:bg-white/10 rounded border border-white/20 dark:border-white/20"
                  >
                    {sc}
                  </kbd>
                ))}
              </div>
            )}
          </div>
        )
      }
    />
  );
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({ children }) => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Base navigation actions
  const getNavigationActions = () => {
    const baseActions = [
      {
        id: 'dashboard',
        name: 'Dashboard',
        shortcut: ['d'],
        keywords: 'dashboard home overview',
        section: 'Navigation',
        icon: <BarChart3 className="w-4 h-4" />,
        perform: () => navigate('/dashboard'),
      },
      {
        id: 'chat',
        name: 'Chat with ARIA',
        shortcut: ['c'],
        keywords: 'chat aria ai assistant',
        section: 'Navigation',
        icon: <MessageSquare className="w-4 h-4" />,
        perform: () => navigate('/chat'),
      },
      {
        id: 'settings',
        name: 'Settings',
        shortcut: ['s'],
        keywords: 'settings preferences config',
        section: 'Navigation',
        icon: <Settings className="w-4 h-4" />,
        perform: () => navigate('/settings'),
      },
    ];

    // Role-specific actions
    if (profile?.role === 'solo') {
      baseActions.push(
        {
          id: 'program',
          name: 'Program',
          shortcut: ['p'],
          keywords: 'program training workout solo',
          section: 'Navigation',
          icon: <Activity className="w-4 h-4" />,
          perform: () => navigate('/program'),
        },
        {
          id: 'training-plan',
          name: 'Training Plan',
          shortcut: ['t'],
          keywords: 'training plan calendar schedule',
          section: 'Navigation',
          icon: <Calendar className="w-4 h-4" />,
          perform: () => navigate('/training-plan'),
        }
      );
    }

    if (profile?.role === 'coach') {
      baseActions.push(
        {
          id: 'athletes',
          name: 'Athletes',
          shortcut: ['a'],
          keywords: 'athletes team members',
          section: 'Navigation',
          icon: <Users className="w-4 h-4" />,
          perform: () => navigate('/athletes'),
        },
        {
          id: 'risk-board',
          name: 'Risk Board',
          shortcut: ['r'],
          keywords: 'risk board alerts warnings',
          section: 'Navigation',
          icon: <AlertTriangle className="w-4 h-4" />,
          perform: () => navigate('/risk-board'),
        },
        {
          id: 'training-programs',
          name: 'Training Programs',
          shortcut: ['t'],
          keywords: 'training programs templates workouts',
          section: 'Navigation',
          icon: <BookOpen className="w-4 h-4" />,
          perform: () => navigate('/training-plan'),
        },
        {
          id: 'calendar',
          name: 'Calendar',
          shortcut: ['l'],
          keywords: 'calendar schedule sessions',
          section: 'Navigation',
          icon: <Calendar className="w-4 h-4" />,
          perform: () => navigate('/calendar'),
        }
      );
    }

    if (profile?.role === 'athlete' || profile?.role === 'coach') {
      baseActions.push({
        id: 'analytics',
        name: 'Analytics',
        shortcut: ['n'],
        keywords: 'analytics metrics data insights',
        section: 'Navigation',
        icon: <BarChart3 className="w-4 h-4" />,
        perform: () => navigate('/analytics'),
      });
    }

    return baseActions;
  };

  // Quick action functions
  const getQuickActions = () => {
    const quickActions = [
      {
        id: 'toggle-theme',
        name: `Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`,
        shortcut: ['⌘', 'shift', 't'],
        keywords: 'dark light mode theme toggle',
        section: 'Quick Actions',
        icon: theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />,
        perform: () => toggleTheme(),
      },
      {
        id: 'sign-out',
        name: 'Sign Out',
        shortcut: ['⌘', 'shift', 'q'],
        keywords: 'sign out logout quit exit',
        section: 'Quick Actions',
        icon: <LogOut className="w-4 h-4" />,
        perform: () => signOut(),
      },
    ];

    // Coach-only actions
    if (profile?.role === 'coach') {
      quickActions.unshift({
        id: 'invite-athlete',
        name: 'Invite Athlete',
        shortcut: ['⌘', 'i'],
        keywords: 'invite athlete add team member',
        section: 'Quick Actions',
        icon: <UserPlus className="w-4 h-4" />,
        perform: () => {
          navigate('/athletes');
        },
      });
    }

    return quickActions;
  };

  const actions = [
    ...getNavigationActions(),
    ...getQuickActions(),
  ];

  return (
    <KBarProvider actions={actions}>
      <KBarPortal>
        <KBarPositioner className="fixed inset-0 z-50 bg-black/20 dark:bg-black/40 backdrop-blur-sm">
          <KBarAnimator className="mx-auto mt-[10vh] max-w-lg">
            <div className={cn(
              "overflow-hidden rounded-2xl shadow-xl",
              "bg-white/90 dark:bg-gray-900/90",
              "backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50"
            )}>
              <KBarSearch 
                className={cn(
                  "w-full border-none bg-transparent px-4 py-4 text-lg outline-none",
                  "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                  "text-gray-900 dark:text-white"
                )}
                placeholder="Type a command or search..."
              />
              <div className="border-t border-gray-200/50 dark:border-gray-700/50">
                <RenderResults />
              </div>
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </KBarProvider>
  );
};
