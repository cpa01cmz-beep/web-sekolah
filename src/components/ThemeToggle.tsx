import { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';

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
      className={`${className} text-2xl hover:scale-110 hover:rotate-12 transition-all duration-200 active:scale-90 z-50`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
    </Button>
  );
});
