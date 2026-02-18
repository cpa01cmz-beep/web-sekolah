import { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle = memo(function ThemeToggle({ className = "absolute top-4 right-4" }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  const handleClick = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  return (
    <Button 
      onClick={handleClick} 
      variant="ghost"
      size="icon"
      className={`${className} hover:scale-110 transition-all duration-200 active:scale-90 z-50`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="h-5 w-5 transition-transform hover:rotate-12" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5 transition-transform hover:-rotate-12" aria-hidden="true" />
      )}
    </Button>
  );
});
