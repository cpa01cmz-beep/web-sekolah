import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../use-theme';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/constants/storage-keys';

describe('useTheme', () => {
  const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  beforeEach(() => {
    storage.clear();
    document.documentElement.classList.remove('dark');
    vi.clearAllMocks();
    window.matchMedia = mockMatchMedia;
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  describe('Initialization', () => {
    it('should initialize with system preference when no saved theme', () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as MediaQueryList);

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should initialize with light mode when system prefers light', () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as MediaQueryList);

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(false);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should initialize with saved theme from localStorage', () => {
      storage.setItem(STORAGE_KEYS.THEME, 'dark');

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should initialize with light mode when saved theme is light', () => {
      storage.setItem(STORAGE_KEYS.THEME, 'light');

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(false);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should prefer saved theme over system preference', () => {
      storage.setItem(STORAGE_KEYS.THEME, 'light');

      mockMatchMedia.mockReturnValue({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as MediaQueryList);

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(false);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('Theme Toggle', () => {
    it('should toggle from light to dark', () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as MediaQueryList);

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(false);

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.isDark).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(storage.getItem(STORAGE_KEYS.THEME)).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      storage.setItem(STORAGE_KEYS.THEME, 'dark');

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(true);

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.isDark).toBe(false);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(storage.getItem(STORAGE_KEYS.THEME)).toBe('light');
    });

    it('should persist theme to localStorage on toggle', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      expect(storage.getItem(STORAGE_KEYS.THEME)).toBe('dark');
    });

    it('should update document class when toggling to dark', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should update document class when toggling to light', () => {
      storage.setItem(STORAGE_KEYS.THEME, 'dark');

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('Multiple Toggles', () => {
    it('should handle multiple rapid toggles', () => {
      const { result } = renderHook(() => useTheme());

      const initialState = result.current.isDark;

      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.isDark).toBe(!initialState);

      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.isDark).toBe(initialState);

      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.isDark).toBe(!initialState);
    });

    it('should persist final theme after multiple toggles', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });
      act(() => {
        result.current.toggleTheme();
      });
      act(() => {
        result.current.toggleTheme();
      });

      expect(storage.getItem(STORAGE_KEYS.THEME)).toBe('dark');
    });
  });

  describe('Document Class Management', () => {
    it('should add dark class when isDark is true', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should remove dark class when isDark is false', () => {
      storage.setItem(STORAGE_KEYS.THEME, 'dark');

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should not have duplicate dark classes', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      const darkClassCount = document.documentElement.className
        .split(' ')
        .filter((c) => c === 'dark').length;
      expect(darkClassCount).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty localStorage gracefully', () => {
      storage.clear();

      const { result } = renderHook(() => useTheme());

      expect(typeof result.current.isDark).toBe('boolean');
    });

    it('should handle invalid theme values in localStorage', () => {
      storage.setItem(STORAGE_KEYS.THEME, 'invalid');

      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as MediaQueryList);

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(false);
    });

    it('should handle null in localStorage gracefully', () => {
      storage.setItem(STORAGE_KEYS.THEME, '');

      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as MediaQueryList);

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(false);
    });

    it('should initialize correctly when document element has existing classes', () => {
      document.documentElement.classList.add('existing-class');

      const { result } = renderHook(() => useTheme());

      expect(document.documentElement.classList.contains('existing-class')).toBe(true);
      expect(typeof result.current.isDark).toBe('boolean');
    });
  });

  describe('Hook Return Value', () => {
    it('should return isDark boolean and toggleTheme function', () => {
      const { result } = renderHook(() => useTheme());

      expect(typeof result.current.isDark).toBe('boolean');
      expect(typeof result.current.toggleTheme).toBe('function');
    });

    it('should maintain consistent return value shape', () => {
      const { result } = renderHook(() => useTheme());

      const { isDark: firstIsDark, toggleTheme: firstToggleTheme } = result.current;
      const { isDark: secondIsDark, toggleTheme: secondToggleTheme } = result.current;

      expect(typeof firstIsDark).toBe('boolean');
      expect(typeof firstToggleTheme).toBe('function');
      expect(typeof secondIsDark).toBe('boolean');
      expect(typeof secondToggleTheme).toBe('function');
    });
  });

  describe('Integration with Storage', () => {
    it('should read theme from storage on mount', () => {
      storage.setItem(STORAGE_KEYS.THEME, 'dark');

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(true);
    });

    it('should write theme to storage on toggle', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      expect(storage.getItem(STORAGE_KEYS.THEME)).toBe('dark');
    });

    it('should overwrite storage value on toggle', () => {
      storage.setItem(STORAGE_KEYS.THEME, 'dark');

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      expect(storage.getItem(STORAGE_KEYS.THEME)).toBe('light');
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as MediaQueryList);

      const { result, rerender } = renderHook(() => useTheme());

      const initialState = result.current.isDark;
      rerender();
      const stateAfterRerender = result.current.isDark;

      expect(initialState).toBe(stateAfterRerender);
    });

    it('should only update document class when theme changes', () => {
      const classListSpy = vi.spyOn(document.documentElement.classList, 'add');
      const classListRemoveSpy = vi.spyOn(document.documentElement.classList, 'remove');

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      expect(classListSpy).toHaveBeenCalledWith('dark');

      act(() => {
        result.current.toggleTheme();
      });

      expect(classListRemoveSpy).toHaveBeenCalledWith('dark');

      classListSpy.mockRestore();
      classListRemoveSpy.mockRestore();
    });
  });
});
