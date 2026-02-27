import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '../use-mobile'

describe('useIsMobile', () => {
  const mockAddEventListener = vi.fn()
  const mockRemoveEventListener = vi.fn()

  const createMockMediaQueryList = (matches: boolean): MediaQueryList =>
    ({
      matches,
      media: '(max-width: 767px)',
      onchange: null,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      dispatchEvent: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }) as unknown as MediaQueryList

  beforeEach(() => {
    vi.clearAllMocks()
    mockAddEventListener.mockClear()
    mockRemoveEventListener.mockClear()

    // Reset window.innerWidth to desktop size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    window.matchMedia = vi.fn((query: string) => {
      if (query === '(max-width: 767px)') {
        return createMockMediaQueryList(false)
      }
      return createMockMediaQueryList(false)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('should return false on desktop screen', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })
      window.matchMedia = vi.fn((query: string) => createMockMediaQueryList(false))

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(false)
    })

    it('should return true on mobile screen', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })
      window.matchMedia = vi.fn((query: string) => createMockMediaQueryList(true))

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(true)
    })

    it('should set up media query listener on mount', () => {
      renderHook(() => useIsMobile())

      expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)')
      expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('should use correct breakpoint (767px)', () => {
      renderHook(() => useIsMobile())

      expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)')
    })

    it('should initialize based on current window width', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })
      window.matchMedia = vi.fn((query: string) => createMockMediaQueryList(true))

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(true)
    })
  })

  describe('Media Query Event Listener Setup', () => {
    it('should add change event listener on mount', () => {
      renderHook(() => useIsMobile())

      expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('should add event listener with correct event name', () => {
      const { unmount } = renderHook(() => useIsMobile())

      expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function))
      unmount()
    })

    it('should store listener for cleanup', () => {
      const { unmount } = renderHook(() => useIsMobile())

      const callArgs = mockAddEventListener.mock.calls[0]
      expect(callArgs[0]).toBe('change')
      expect(typeof callArgs[1]).toBe('function')

      unmount()
    })
  })

  describe('Media Query Event Listener Cleanup', () => {
    it('should remove change event listener on unmount', () => {
      const { unmount } = renderHook(() => useIsMobile())

      unmount()

      expect(mockRemoveEventListener).toHaveBeenCalled()
    })

    it('should remove event listener with correct event name', () => {
      const { unmount } = renderHook(() => useIsMobile())

      unmount()

      expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('should remove same listener that was added', () => {
      const { unmount } = renderHook(() => useIsMobile())

      const addedListener = mockAddEventListener.mock.calls[0]?.[1]
      unmount()

      expect(mockRemoveEventListener).toHaveBeenCalledWith('change', addedListener)
    })

    it('should clean up on component unmount', () => {
      const { unmount } = renderHook(() => useIsMobile())

      expect(mockRemoveEventListener).not.toHaveBeenCalled()

      unmount()

      expect(mockRemoveEventListener).toHaveBeenCalled()
    })
  })

  describe('Responsive Behavior', () => {
    it('should update state when media query changes from desktop to mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })
      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(false)

      const changeListener = mockAddEventListener.mock.calls[0]?.[1]

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 500,
        })
        changeListener({ matches: true, media: '(max-width: 767px)' } as MediaQueryListEvent)
      })

      expect(result.current).toBe(true)
    })

    it('should update state when media query changes from mobile to desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })
      window.matchMedia = vi.fn((query: string) => createMockMediaQueryList(true))
      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(true)

      const changeListener = mockAddEventListener.mock.calls[0]?.[1]

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1024,
        })
        changeListener({ matches: false, media: '(max-width: 767px)' } as MediaQueryListEvent)
      })

      expect(result.current).toBe(false)
    })

    it('should handle multiple media query changes', () => {
      const { result } = renderHook(() => useIsMobile())

      const changeListener = mockAddEventListener.mock.calls[0]?.[1]

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 500,
        })
        changeListener({ matches: true, media: '(max-width: 767px)' } as MediaQueryListEvent)
      })

      expect(result.current).toBe(true)

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1024,
        })
        changeListener({ matches: false, media: '(max-width: 767px)' } as MediaQueryListEvent)
      })

      expect(result.current).toBe(false)

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 500,
        })
        changeListener({ matches: true, media: '(max-width: 767px)' } as MediaQueryListEvent)
      })

      expect(result.current).toBe(true)
    })

    it('should respond to window resize events', () => {
      const { result } = renderHook(() => useIsMobile())

      const changeListener = mockAddEventListener.mock.calls[0]?.[1]

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 500,
        })
        changeListener({ matches: true, media: '(max-width: 767px)' } as MediaQueryListEvent)
      })

      expect(result.current).toBe(true)
    })
  })

  describe('Multiple Hook Instances', () => {
    it('should work correctly with multiple hook instances', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })
      const { result: result1 } = renderHook(() => useIsMobile())
      const { result: result2 } = renderHook(() => useIsMobile())

      expect(result1.current).toBe(false)
      expect(result2.current).toBe(false)
    })

    it('should handle multiple instances independently', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })
      window.matchMedia = vi.fn((query: string) => createMockMediaQueryList(true))

      const { result: result1 } = renderHook(() => useIsMobile())
      const { result: result2 } = renderHook(() => useIsMobile())

      expect(result1.current).toBe(true)
      expect(result2.current).toBe(true)
    })

    it('should not interfere between multiple instances', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })
      const { result: result1 } = renderHook(() => useIsMobile())
      const { result: result2 } = renderHook(() => useIsMobile())

      const changeListener1 = mockAddEventListener.mock.calls[0]?.[1]
      const changeListener2 = mockAddEventListener.mock.calls[1]?.[1]

      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 500,
        })
        // Trigger both change listeners
        changeListener1({ matches: true, media: '(max-width: 767px)' } as MediaQueryListEvent)
        changeListener2({ matches: true, media: '(max-width: 767px)' } as MediaQueryListEvent)
      })

      expect(result1.current).toBe(true)
      expect(result2.current).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid media query changes', () => {
      const { result } = renderHook(() => useIsMobile())

      const changeListener = mockAddEventListener.mock.calls[0]?.[1]

      for (let i = 0; i < 10; i++) {
        act(() => {
          const isMobile = i % 2 === 0
          changeListener({ matches: isMobile, media: '(max-width: 767px)' } as MediaQueryListEvent)
        })
      }

      expect(typeof result.current).toBe('boolean')
    })

    it('should handle media query with no matches property', () => {
      const invalidMediaQueryList = {
        media: '(max-width: 767px)',
        onchange: null,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
        dispatchEvent: vi.fn(),
      } as unknown as MediaQueryList

      window.matchMedia = vi.fn((query: string) => invalidMediaQueryList)

      const { result } = renderHook(() => useIsMobile())

      expect(typeof result.current).toBe('boolean')
    })

    it('should maintain boolean return type always', () => {
      const { result } = renderHook(() => useIsMobile())

      expect(typeof result.current).toBe('boolean')
      expect([true, false]).toContain(result.current)
    })
  })

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const { result, rerender } = renderHook(() => useIsMobile())

      const initialState = result.current
      rerender()
      const stateAfterRerender = result.current

      expect(initialState).toBe(stateAfterRerender)
    })

    it('should only update state on media query change', () => {
      const { result } = renderHook(() => useIsMobile())

      const initialState = result.current

      const changeListener = mockAddEventListener.mock.calls[0]?.[1]

      act(() => {
        changeListener({ matches: false, media: '(max-width: 767px)' } as MediaQueryListEvent)
      })

      const stateAfterSameMedia = result.current

      expect(initialState).toBe(stateAfterSameMedia)
    })
  })

  describe('Hook Return Value', () => {
    it('should return boolean value', () => {
      const { result } = renderHook(() => useIsMobile())

      expect(typeof result.current).toBe('boolean')
    })

    it('should maintain consistent return value type', () => {
      const { result } = renderHook(() => useIsMobile())

      const firstValue = result.current
      const secondValue = result.current

      expect(typeof firstValue).toBe('boolean')
      expect(typeof secondValue).toBe('boolean')
    })

    it('should return !!isMobile (boolean not undefined)', () => {
      const mediaQueryWithoutMatches = {
        media: '(max-width: 767px)',
        onchange: null,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
        dispatchEvent: vi.fn(),
      } as unknown as MediaQueryList

      window.matchMedia = vi.fn((query: string) => mediaQueryWithoutMatches)

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(false)
    })
  })

  describe('Media Query Configuration', () => {
    it('should use MOBILE_BREAKPOINT constant of 768', () => {
      renderHook(() => useIsMobile())

      expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)')
    })

    it('should use correct max-width query', () => {
      renderHook(() => useIsMobile())

      expect(window.matchMedia.mock.calls[0][0]).toContain('max-width')
    })

    it('should use breakpoint - 1 in query (767px)', () => {
      renderHook(() => useIsMobile())

      const query = window.matchMedia.mock.calls[0][0]
      expect(query).toBe('(max-width: 767px)')
    })
  })

  describe('Integration with Window', () => {
    it('should access window.matchMedia API', () => {
      renderHook(() => useIsMobile())

      expect(window.matchMedia).toHaveBeenCalled()
    })

    it('should use window.matchMedia only once on mount', () => {
      renderHook(() => useIsMobile())

      expect(window.matchMedia).toHaveBeenCalledTimes(1)
    })
  })
})
