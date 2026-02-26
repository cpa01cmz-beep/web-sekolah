import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { OfflineIndicator } from '@/components/OfflineIndicator'

describe('OfflineIndicator', () => {
  beforeEach(() => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
    vi.spyOn(window, 'addEventListener')
    vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  describe('Online State', () => {
    it('should not render when online', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
      render(<OfflineIndicator />)

      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('should not render "You are offline" message when online', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
      render(<OfflineIndicator />)

      expect(screen.queryByText('You are offline')).not.toBeInTheDocument()
    })
  })

  describe('Offline State', () => {
    it('should render when offline', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
      render(<OfflineIndicator />)

      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should render offline message when offline', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
      render(<OfflineIndicator />)

      expect(screen.getByText('You are offline')).toBeInTheDocument()
    })

    it('should render WifiOff icon when offline', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
      const { container } = render(<OfflineIndicator />)

      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Event Listeners', () => {
    it('should add online event listener on mount when online', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)

      render(<OfflineIndicator />)

      expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))
    })

    it('should show indicator when offline event fires', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
      const { rerender } = render(<OfflineIndicator />)

      expect(screen.queryByRole('status')).not.toBeInTheDocument()

      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
      window.dispatchEvent(new Event('offline'))
      rerender(<OfflineIndicator />)

      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should hide indicator when online event fires', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
      const { rerender } = render(<OfflineIndicator />)

      expect(screen.getByRole('status')).toBeInTheDocument()

      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
      window.dispatchEvent(new Event('online'))
      rerender(<OfflineIndicator />)

      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('should add event listeners and cleanup on unmount', async () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
      const { unmount } = render(<OfflineIndicator />)

      await Promise.resolve()

      expect(window.addEventListener).toHaveBeenCalledWith('online', expect.any(Function))
      expect(window.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function))

      unmount()

      expect(window.removeEventListener).toHaveBeenCalledWith('online', expect.any(Function))
      expect(window.removeEventListener).toHaveBeenCalledWith('offline', expect.any(Function))
    })
  })

  describe('Custom ClassName', () => {
    it('should apply custom className when provided', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
      const { container } = render(<OfflineIndicator className="custom-offline" />)

      expect(container.querySelector('.custom-offline')).toBeInTheDocument()
    })

    it('should have default positioning class', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
      const { container } = render(<OfflineIndicator />)

      expect(container.querySelector('.fixed')).toBeInTheDocument()
      expect(container.querySelector('.bottom-4')).toBeInTheDocument()
      expect(container.querySelector('.right-4')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have role status when offline', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
      render(<OfflineIndicator />)

      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should have aria-live polite for screen readers', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
      render(<OfflineIndicator />)

      const status = screen.getByRole('status')
      expect(status).toHaveAttribute('aria-live', 'polite')
    })

    it('should have aria-hidden on icon', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
      const { container } = render(<OfflineIndicator />)

      const icon = container.querySelector('svg')
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })

    it('should render accessible text', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
      render(<OfflineIndicator />)

      expect(screen.getByText('You are offline')).toBeVisible()
    })
  })

  describe('Styling', () => {
    it('should have rounded-lg class', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
      const { container } = render(<OfflineIndicator />)

      expect(container.querySelector('.rounded-lg')).toBeInTheDocument()
    })

    it('should have shadow-lg class', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
      const { container } = render(<OfflineIndicator />)

      expect(container.querySelector('.shadow-lg')).toBeInTheDocument()
    })

    it('should have flex and items-center classes', () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
      const { container } = render(<OfflineIndicator />)

      expect(container.querySelector('.flex')).toBeInTheDocument()
      expect(container.querySelector('.items-center')).toBeInTheDocument()
    })
  })

  describe('Memoization', () => {
    it('should have displayName for React DevTools', () => {
      expect(OfflineIndicator.displayName).toBe('OfflineIndicator')
    })
  })
})
