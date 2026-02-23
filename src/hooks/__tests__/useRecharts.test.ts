import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import React from 'react'
import { useRecharts } from '../useRecharts'

vi.mock('recharts/es6/chart/BarChart', () => ({
  BarChart: vi.fn().mockReturnValue(() => React.createElement('div', null, 'BarChart')),
}))

vi.mock('recharts/es6/cartesian/Bar', () => ({
  Bar: vi.fn().mockReturnValue(() => React.createElement('div', null, 'Bar')),
}))

vi.mock('recharts/es6/cartesian/XAxis', () => ({
  XAxis: vi.fn().mockReturnValue(() => React.createElement('div', null, 'XAxis')),
}))

vi.mock('recharts/es6/cartesian/YAxis', () => ({
  YAxis: vi.fn().mockReturnValue(() => React.createElement('div', null, 'YAxis')),
}))

vi.mock('recharts/es6/cartesian/CartesianGrid', () => ({
  CartesianGrid: vi.fn().mockReturnValue(() => React.createElement('div', null, 'CartesianGrid')),
}))

vi.mock('recharts/es6/component/Tooltip', () => ({
  Tooltip: vi.fn().mockReturnValue(() => React.createElement('div', null, 'Tooltip')),
}))

vi.mock('recharts/es6/component/Legend', () => ({
  Legend: vi.fn().mockReturnValue(() => React.createElement('div', null, 'Legend')),
}))

vi.mock('recharts/es6/component/ResponsiveContainer', () => ({
  ResponsiveContainer: vi
    .fn()
    .mockReturnValue(() => React.createElement('div', null, 'ResponsiveContainer')),
}))

vi.mock('recharts/es6/chart/LineChart', () => ({
  LineChart: vi.fn().mockReturnValue(() => React.createElement('div', null, 'LineChart')),
}))

vi.mock('recharts/es6/cartesian/Line', () => ({
  Line: vi.fn().mockReturnValue(() => React.createElement('div', null, 'Line')),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}))

describe('useRecharts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('loading states', () => {
    it('should start with loading state', () => {
      const { result } = renderHook(() => useRecharts({ components: ['BarChart'] }))

      expect(result.current.isLoading).toBe(true)
      expect(result.current.components).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('should load components successfully', async () => {
      const { result } = renderHook(() => useRecharts({ components: ['BarChart', 'Bar'] }))

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.components).not.toBeNull()
      expect(result.current.components?.BarChart).toBeDefined()
      expect(result.current.components?.Bar).toBeDefined()
      expect(result.current.error).toBeNull()
    })
  })

  describe('component loading', () => {
    it('should load chart components', async () => {
      const { result } = renderHook(() => useRecharts({ components: ['BarChart', 'LineChart'] }))

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.components?.BarChart).toBeDefined()
      expect(result.current.components?.LineChart).toBeDefined()
    })

    it('should load cartesian components', async () => {
      const { result } = renderHook(() =>
        useRecharts({ components: ['XAxis', 'YAxis', 'CartesianGrid'] })
      )

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.components?.XAxis).toBeDefined()
      expect(result.current.components?.YAxis).toBeDefined()
      expect(result.current.components?.CartesianGrid).toBeDefined()
    })

    it('should load utility components', async () => {
      const { result } = renderHook(() =>
        useRecharts({ components: ['Tooltip', 'Legend', 'ResponsiveContainer'] })
      )

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.components?.Tooltip).toBeDefined()
      expect(result.current.components?.Legend).toBeDefined()
      expect(result.current.components?.ResponsiveContainer).toBeDefined()
    })

    it('should load multiple components at once', async () => {
      const { result } = renderHook(() =>
        useRecharts({
          components: [
            'BarChart',
            'Bar',
            'XAxis',
            'YAxis',
            'CartesianGrid',
            'Tooltip',
            'Legend',
            'ResponsiveContainer',
          ],
        })
      )

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(Object.keys(result.current.components || {}).length).toBe(8)
    })
  })

  describe('error handling', () => {
    it('should handle unknown component name', async () => {
      const { result } = renderHook(() => useRecharts({ components: ['UnknownComponent' as any] }))

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.error).toBeDefined()
      expect(result.current.error?.message).toContain('Unknown Recharts component')
      expect(result.current.components).toBeNull()
    })

    it('should handle import failure', async () => {
      vi.doMock('recharts/es6/chart/PieChart', () => {
        throw new Error('Import failed')
      })

      const { result } = renderHook(() => useRecharts({ components: ['PieChart'] }))

      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 })
    })
  })

  describe('memoization', () => {
    it('should not reload components when same components are passed', async () => {
      const { result, rerender } = renderHook(({ components }) => useRecharts({ components }), {
        initialProps: { components: ['BarChart'] as const },
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      const firstComponents = result.current.components

      rerender({ components: ['BarChart'] })

      expect(result.current.components).toStrictEqual(firstComponents)
    })

    it('should reload when components change', async () => {
      const { result, rerender } = renderHook(({ components }) => useRecharts({ components }), {
        initialProps: { components: ['BarChart'] as const },
      })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      rerender({ components: ['BarChart', 'LineChart'] })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(Object.keys(result.current.components || {}).length).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle empty components array', async () => {
      const { result } = renderHook(() => useRecharts({ components: [] }))

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.components).toEqual({})
      expect(result.current.error).toBeNull()
    })

    it('should handle single component', async () => {
      const { result } = renderHook(() => useRecharts({ components: ['ResponsiveContainer'] }))

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.components?.ResponsiveContainer).toBeDefined()
    })
  })
})
