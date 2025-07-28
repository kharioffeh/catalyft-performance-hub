import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  BarChart, 
  Dumbbell, 
  Users, 
  MessageCircle, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Custom hook to get window dimensions for web
function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    function handleResize() {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return windowDimensions;
}

// Define navigation screens
const navigationScreens = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: Home,
    label: 'Dashboard'
  },
  {
    name: 'TrainingPlan',
    path: '/training-plan',
    icon: Dumbbell,
    label: 'Training'
  },
  {
    name: 'Analytics',
    path: '/analytics',
    icon: BarChart,
    label: 'Analytics'
  },
  {
    name: 'Calendar',
    path: '/calendar',
    icon: Calendar,
    label: 'Calendar'
  },
  {
    name: 'Athletes',
    path: '/athletes',
    icon: Users,
    label: 'Athletes'
  },
  {
    name: 'Chat',
    path: '/chat',
    icon: MessageCircle,
    label: 'Chat'
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Settings,
    label: 'Settings'
  }
];

// Bottom Tab Navigator for mobile
interface BottomTabNavigatorProps {
  className?: string;
}

function BottomTabNavigator({ className }: BottomTabNavigatorProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Only show first 5 items in bottom tabs
  const mobileScreens = navigationScreens.slice(0, 5);

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 px-2 py-1 z-50",
      className
    )}>
      <div className="flex justify-around items-center h-14">
        {mobileScreens.map((screen) => {
          const IconComponent = screen.icon;
          const isActive = location.pathname === screen.path || 
                          (screen.path === '/dashboard' && location.pathname === '/');
          
          return (
            <button
              key={screen.name}
              onClick={() => navigate(screen.path)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[60px]",
                isActive ? "text-indigo-500" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <IconComponent 
                size={20} 
                className={cn(
                  "mb-1",
                  isActive ? "fill-current" : ""
                )}
              />
              <span className="text-xs font-medium truncate">{screen.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Drawer Navigator for desktop and tablet
interface DrawerNavigatorProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

function DrawerNavigator({ isOpen, onClose, className }: DrawerNavigatorProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div className={cn(
        "fixed left-0 top-0 h-full bg-gray-900 border-r border-gray-700 z-50 transition-transform duration-300",
        isMobile ? "w-80" : "w-72",
        isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-gray-100">Navigation</h2>
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-200"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2">
          {navigationScreens.map((screen) => {
            const IconComponent = screen.icon;
            const isActive = location.pathname === screen.path || 
                            (screen.path === '/dashboard' && location.pathname === '/');
            
            return (
              <button
                key={screen.name}
                onClick={() => {
                  navigate(screen.path);
                  if (isMobile) onClose();
                }}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                  isActive 
                    ? "bg-gray-800 text-indigo-500" 
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                )}
              >
                <IconComponent 
                  size={20} 
                  className={isActive ? "fill-current" : ""}
                />
                <span className="font-medium">{screen.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}

// Main Navigation Component
interface NavigationProps {
  children: React.ReactNode;
}

export default function Navigation({ children }: NavigationProps) {
  const { width } = useWindowDimensions();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = width < 768;

  // Close drawer when screen size changes to desktop
  useEffect(() => {
    if (!isMobile) {
      setDrawerOpen(false);
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Mobile Header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-700 px-4 py-3 z-30">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-200"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold">Catalyft</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>
      )}

      {/* Drawer */}
      <DrawerNavigator 
        isOpen={drawerOpen || !isMobile} 
        onClose={() => setDrawerOpen(false)} 
      />

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300",
        isMobile ? "pt-16 pb-16" : "ml-72"
      )}>
        {children}
      </main>

      {/* Bottom Tab Navigator for mobile */}
      {isMobile && <BottomTabNavigator />}
    </div>
  );
}

// Hook to detect if we're on mobile
export function useIsMobile() {
  const { width } = useWindowDimensions();
  return width < 768;
}

// Navigation helper functions
export const navigationUtils = {
  // Get navigation screens
  getScreens: () => navigationScreens,
  
  // Find screen by path
  findScreenByPath: (path: string) => {
    return navigationScreens.find(screen => screen.path === path);
  },
  
  // Check if a route is active
  isRouteActive: (currentPath: string, targetPath: string) => {
    return currentPath === targetPath || 
           (targetPath === '/dashboard' && currentPath === '/');
  },
};