
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

export const ThemeToggle: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-9 w-9 p-0 transition-all duration-200",
            "bg-glass-card-light/60 dark:bg-glass-card-dark/80",
            "backdrop-blur-md border border-white/20 dark:border-white/10",
            "hover:bg-glass-card-light/80 dark:hover:bg-glass-card-dark/90",
            "text-gray-800 dark:text-white/80",
            "shadow-glass-sm"
          )}
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={cn(
          "bg-glass-card-light/90 dark:bg-glass-card-dark/90",
          "backdrop-blur-md border border-white/20 dark:border-white/10",
          "shadow-glass-md"
        )}
      >
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className={cn(
            "cursor-pointer",
            theme === 'light' && "bg-white/20"
          )}
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className={cn(
            "cursor-pointer",
            theme === 'dark' && "bg-white/20"
          )}
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className={cn(
            "cursor-pointer",
            theme === 'system' && "bg-white/20"
          )}
        >
          <Sun className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
