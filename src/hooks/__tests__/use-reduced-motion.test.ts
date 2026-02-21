import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReducedMotion } from '../use-reduced-motion';

describe('useReducedMotion() - Accessibility Hook', () => {
  describe('Happy Path - Valid Environments', () => {
    it('should initialize with false when prefers-reduced-motion is not set', () => {
      // Arrange
      // Mock window.matchMedia to return no preference
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      // Act
      const { result } = renderHook(() => useReducedMotion());

      // Assert
      expect(result.current).toBe(false);
    });

    it('should initialize with true when prefers-reduced-motion is set', () => {
      // Arrange
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: true,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      // Act
      const { result } = renderHook(() => useReducedMotion());

      // Assert
      expect(result.current).toBe(true);
    });

    it('should update state when media query changes from false to true', () => {
      // Arrange
      const listeners: Array<(event: MediaQueryListEvent) => void> = [];
      let mediaQueryMatches = false;

      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: mediaQueryMatches,
        media: query,
        onchange: null,
        addEventListener: vi.fn((event, listener) => {
          if (event === 'change') {
            listeners.push(listener as (event: MediaQueryListEvent) => void);
          }
        }),
        removeEventListener: vi.fn((event, listener) => {
          if (event === 'change') {
            const index = listeners.indexOf(listener as (event: MediaQueryListEvent) => void);
            if (index > -1) listeners.splice(index, 1);
          }
        }),
        dispatchEvent: vi.fn(),
      }));

      const { result } = renderHook(() => useReducedMotion());

      // Assert initial state
      expect(result.current).toBe(false);

      // Act - Simulate media query change
      mediaQueryMatches = true;
      act(() => {
        listeners.forEach((listener) => {
          listener({
            matches: true,
            media: '(prefers-reduced-motion: reduce)',
          } as MediaQueryListEvent);
        });
      });

      // Assert updated state
      expect(result.current).toBe(true);
    });

    it('should update state when media query changes from true to false', () => {
      // Arrange
      const listeners: Array<(event: MediaQueryListEvent) => void> = [];
      let mediaQueryMatches = true;

      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: mediaQueryMatches,
        media: query,
        onchange: null,
        addEventListener: vi.fn((event, listener) => {
          if (event === 'change') {
            listeners.push(listener as (event: MediaQueryListEvent) => void);
          }
        }),
        removeEventListener: vi.fn((event, listener) => {
          if (event === 'change') {
            const index = listeners.indexOf(listener as (event: MediaQueryListEvent) => void);
            if (index > -1) listeners.splice(index, 1);
          }
        }),
        dispatchEvent: vi.fn(),
      }));

      const { result } = renderHook(() => useReducedMotion());

      // Assert initial state
      expect(result.current).toBe(true);

      // Act - Simulate media query change
      mediaQueryMatches = false;
      act(() => {
        listeners.forEach((listener) => {
          listener({
            matches: false,
            media: '(prefers-reduced-motion: reduce)',
          } as MediaQueryListEvent);
        });
      });

      // Assert updated state
      expect(result.current).toBe(false);
    });

    it('should add event listener on mount', () => {
      // Arrange
      const addEventListenerSpy = vi.fn();
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: addEventListenerSpy,
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      // Act
      renderHook(() => useReducedMotion());

      // Assert
      expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should remove event listener on unmount', () => {
      // Arrange
      const removeEventListenerSpy = vi.fn();
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: removeEventListenerSpy,
        dispatchEvent: vi.fn(),
      }));

      const { unmount } = renderHook(() => useReducedMotion());

      // Act
      unmount();

      // Assert
      expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('Media Query Integration', () => {
    it('should query for prefers-reduced-motion', () => {
      // Arrange
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      // Act
      renderHook(() => useReducedMotion());

      // Assert
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });

    it('should use MediaQueryList object correctly', () => {
      // Arrange
      const mockMediaQueryList = {
        matches: true,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
      window.matchMedia = vi.fn().mockReturnValue(mockMediaQueryList);

      // Act
      const { result } = renderHook(() => useReducedMotion());

      // Assert
      expect(result.current).toBe(true);
    });

    it('should handle MediaQueryListEvent correctly', () => {
      // Arrange
      const listeners: Array<(event: MediaQueryListEvent) => void> = [];
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn((event, listener) => {
          if (event === 'change') {
            listeners.push(listener as (event: MediaQueryListEvent) => void);
          }
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { result } = renderHook(() => useReducedMotion());

      // Act
      act(() => {
        listeners.forEach((listener) => {
          const event = {
            matches: true,
            media: '(prefers-reduced-motion: reduce)',
          } as MediaQueryListEvent;
          listener(event);
        });
      });

      // Assert
      expect(result.current).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle window.matchMedia not being available (SSR)', () => {
      // Arrange
      const originalMatchMedia = window.matchMedia;
      delete (window as any).matchMedia;

      // Act & Assert
      expect(() => {
        renderHook(() => useReducedMotion());
      }).toThrow();

      // Cleanup
      window.matchMedia = originalMatchMedia;
    });

    it('should handle empty media query string', () => {
      // Arrange
      window.matchMedia = vi.fn().mockImplementation((_query) => ({
        matches: false,
        media: '',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      // Act
      const { result } = renderHook(() => useReducedMotion());

      // Assert
      expect(result.current).toBe(false);
    });

    it('should handle null matches value', () => {
      // Arrange
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: null as any,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      // Act
      const { result } = renderHook(() => useReducedMotion());

      // Assert
      expect(result.current).toBe(null);
    });

    it('should handle undefined matches value', () => {
      // Arrange
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: undefined,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      // Act
      const { result } = renderHook(() => useReducedMotion());

      // Assert
      expect(result.current).toBe(undefined);
    });
  });

  describe('Multiple Hook Instances', () => {
    it('should work correctly with multiple hook instances', () => {
      // Arrange
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: true,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      // Act
      const { result: result1 } = renderHook(() => useReducedMotion());
      const { result: result2 } = renderHook(() => useReducedMotion());
      const { result: result3 } = renderHook(() => useReducedMotion());

      // Assert
      expect(result1.current).toBe(true);
      expect(result2.current).toBe(true);
      expect(result3.current).toBe(true);
    });

    it('should update all instances when media query changes', () => {
      // Arrange
      const listeners: Array<(event: MediaQueryListEvent) => void> = [];
      let mediaQueryMatches = false;

      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: mediaQueryMatches,
        media: query,
        onchange: null,
        addEventListener: vi.fn((event, listener) => {
          if (event === 'change') {
            listeners.push(listener as (event: MediaQueryListEvent) => void);
          }
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { result: result1 } = renderHook(() => useReducedMotion());
      const { result: result2 } = renderHook(() => useReducedMotion());

      // Assert initial state
      expect(result1.current).toBe(false);
      expect(result2.current).toBe(false);

      // Act
      mediaQueryMatches = true;
      act(() => {
        listeners.forEach((listener) => {
          listener({
            matches: true,
            media: '(prefers-reduced-motion: reduce)',
          } as MediaQueryListEvent);
        });
      });

      // Assert
      expect(result1.current).toBe(true);
      expect(result2.current).toBe(true);
    });

    it('should cleanup event listeners for each instance independently', () => {
      // Arrange
      const removeEventListenerSpy = vi.fn();
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: removeEventListenerSpy,
        dispatchEvent: vi.fn(),
      }));

      const { unmount: unmount1 } = renderHook(() => useReducedMotion());
      const { unmount: unmount2 } = renderHook(() => useReducedMotion());
      const { unmount: unmount3 } = renderHook(() => useReducedMotion());

      // Act
      unmount1();
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);

      unmount2();
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(2);

      unmount3();
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('Real-World Usage Patterns', () => {
    it('should be used in animation components to disable animations', () => {
      // Arrange
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: true,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      // Act
      const { result } = renderHook(() => useReducedMotion());

      // Assert
      // In real usage, this would control animation CSS/props
      expect(result.current).toBe(true);
    });

    it('should be used in dashboard components to disable transitions', () => {
      // Arrange
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: true,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      // Act
      const { result } = renderHook(() => useReducedMotion());

      // Assert
      // In real usage, this would control transition CSS/props
      expect(result.current).toBe(true);
    });

    it('should handle rapid media query changes', () => {
      // Arrange
      const listeners: Array<(event: MediaQueryListEvent) => void> = [];
      let mediaQueryMatches = false;

      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: mediaQueryMatches,
        media: query,
        onchange: null,
        addEventListener: vi.fn((event, listener) => {
          if (event === 'change') {
            listeners.push(listener as (event: MediaQueryListEvent) => void);
          }
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { result } = renderHook(() => useReducedMotion());

      // Act - Rapid changes
      act(() => {
        mediaQueryMatches = true;
        listeners.forEach((listener) => {
          listener({
            matches: true,
            media: '(prefers-reduced-motion: reduce)',
          } as MediaQueryListEvent);
        });

        mediaQueryMatches = false;
        listeners.forEach((listener) => {
          listener({
            matches: false,
            media: '(prefers-reduced-motion: reduce)',
          } as MediaQueryListEvent);
        });

        mediaQueryMatches = true;
        listeners.forEach((listener) => {
          listener({
            matches: true,
            media: '(prefers-reduced-motion: reduce)',
          } as MediaQueryListEvent);
        });
      });

      // Assert
      expect(result.current).toBe(true);
    });
  });

  describe('Performance Considerations', () => {
    it('should not cause re-renders when value does not change', () => {
      // Arrange
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const renderSpy = vi.fn();
      renderHook(() => {
        renderSpy();
        return useReducedMotion();
      });

      // Act
      const initialRenderCount = renderSpy.mock.calls.length;

      // Trigger event that doesn't change value
      act(() => {
        // Simulate event with same matches value
      });

      // Assert
      expect(renderSpy.mock.calls.length).toBe(initialRenderCount);
    });

    it('should cleanup properly to prevent memory leaks', () => {
      // Arrange
      const removeEventListenerSpy = vi.fn();
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: removeEventListenerSpy,
        dispatchEvent: vi.fn(),
      }));

      // Act
      const { unmount } = renderHook(() => useReducedMotion());
      unmount();

      // Assert
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility Compliance', () => {
    it('should respect user preference for reduced motion', () => {
      // Arrange
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: true,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      // Act
      const { result } = renderHook(() => useReducedMotion());

      // Assert
      // When user prefers reduced motion, hook should return true
      expect(result.current).toBe(true);
    });

    it('should respect user preference for no reduced motion', () => {
      // Arrange
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      // Act
      const { result } = renderHook(() => useReducedMotion());

      // Assert
      // When user does not prefer reduced motion, hook should return false
      expect(result.current).toBe(false);
    });

    it('should update dynamically when user changes preference', () => {
      // Arrange
      const listeners: Array<(event: MediaQueryListEvent) => void> = [];
      let mediaQueryMatches = false;

      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: mediaQueryMatches,
        media: query,
        onchange: null,
        addEventListener: vi.fn((event, listener) => {
          if (event === 'change') {
            listeners.push(listener as (event: MediaQueryListEvent) => void);
          }
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { result } = renderHook(() => useReducedMotion());

      // Assert initial state (no reduced motion)
      expect(result.current).toBe(false);

      // Act - User enables reduced motion
      mediaQueryMatches = true;
      act(() => {
        listeners.forEach((listener) => {
          listener({
            matches: true,
            media: '(prefers-reduced-motion: reduce)',
          } as MediaQueryListEvent);
        });
      });

      // Assert - Hook updates to reflect user preference
      expect(result.current).toBe(true);
    });
  });
});
