import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebouncedValue, useDebouncedCallback, useThrottledCallback } from '../useDebounce'

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: { value: 'initial', delay: 500 },
    })

    expect(result.current).toBe('initial')

    rerender({ value: 'changed', delay: 500 })
    expect(result.current).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe('changed')
  })

  it('should cancel pending update on value change', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: { value: 'initial', delay: 500 },
    })

    rerender({ value: 'first', delay: 500 })
    act(() => {
      vi.advanceTimersByTime(250)
    })

    rerender({ value: 'second', delay: 500 })
    act(() => {
      vi.advanceTimersByTime(250)
    })

    expect(result.current).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(250)
    })

    expect(result.current).toBe('second')
  })

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: { value: 'initial', delay: 500 },
    })

    rerender({ value: 'changed', delay: 1000 })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe('changed')
  })

  it('should work with different value types', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: { value: [1, 2, 3], delay: 100 },
    })

    expect(result.current).toEqual([1, 2, 3])

    rerender({ value: [4, 5, 6], delay: 100 })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current).toEqual([4, 5, 6])
  })
})

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should debounce callback execution', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 500))

    result.current('arg1')
    result.current('arg2')
    result.current('arg3')

    expect(callback).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('arg3')
  })

  it('should cancel pending callback on new call', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 500))

    result.current('first')

    act(() => {
      vi.advanceTimersByTime(250)
    })

    result.current('second')

    act(() => {
      vi.advanceTimersByTime(250)
    })

    expect(callback).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(250)
    })

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('second')
  })
})

describe('useThrottledCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should execute callback immediately on first call', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useThrottledCallback(callback, 500))

    result.current('first')

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('first')
  })

  it('should throttle subsequent calls within delay period', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useThrottledCallback(callback, 500))

    result.current('first')
    result.current('second')
    result.current('third')

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('first')
  })

  it('should allow calls after delay period', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useThrottledCallback(callback, 500))

    result.current('first')

    act(() => {
      vi.advanceTimersByTime(500)
    })

    result.current('second')

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenNthCalledWith(1, 'first')
    expect(callback).toHaveBeenNthCalledWith(2, 'second')
  })
})
