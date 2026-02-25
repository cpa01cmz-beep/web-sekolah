import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'

vi.mock('@/hooks/use-reduced-motion', () => ({
  useReducedMotion: vi.fn(() => false),
}))

vi.mock('@/components/PublicLayout', () => ({
  PublicLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="public-layout">{children}</div>
  ),
}))

vi.mock('@/components/SiteHeader', () => ({
  SiteHeader: () => <header data-testid="site-header">Site Header</header>,
}))

vi.mock('@/components/SiteFooter', () => ({
  SiteFooter: () => <footer data-testid="site-footer">Site Footer</footer>,
}))

vi.mock('@/components/SkipLink', () => ({
  SkipLink: () => null,
}))

vi.mock('@/components/FeatureCard', () => ({
  FeatureCard: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="feature-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ),
}))

vi.mock('@/components/animations', () => ({
  SlideUp: ({ children }: { children: React.ReactNode; delay?: number }) => (
    <div data-testid="slide-up">{children}</div>
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
    if (asChild) {
      return <span data-testid="button-as-child">{children}</span>
    }
    return <button data-testid="button">{children}</button>
  },
}))

const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: BrowserRouter })
}

describe('HomePage', () => {
  describe('Rendering', () => {
    it('should render hero section with welcome heading', () => {
      renderWithRouter(<HomePage />)

      expect(
        screen.getByRole('heading', { name: /welcome to akademia pro/i, level: 1 })
      ).toBeInTheDocument()
    })

    it('should render hero description', () => {
      renderWithRouter(<HomePage />)

      expect(screen.getByText(/the all-in-one school management system/i)).toBeInTheDocument()
    })

    it('should render get started button linking to login', () => {
      renderWithRouter(<HomePage />)

      expect(screen.getByRole('link', { name: /get started/i })).toHaveAttribute('href', '/login')
    })

    it('should render learn more button linking to about', () => {
      renderWithRouter(<HomePage />)

      expect(screen.getByRole('link', { name: /learn more/i })).toHaveAttribute('href', '/about')
    })
  })

  describe('Features Section', () => {
    it('should render features heading', () => {
      renderWithRouter(<HomePage />)

      expect(
        screen.getByRole('heading', { name: /why choose akademia pro/i, level: 2 })
      ).toBeInTheDocument()
    })

    it('should render all feature cards', () => {
      renderWithRouter(<HomePage />)

      const featureCards = screen.getAllByTestId('feature-card')
      expect(featureCards).toHaveLength(3)
    })

    it('should render first feature title', () => {
      renderWithRouter(<HomePage />)

      expect(screen.getByText('Unified Portal')).toBeInTheDocument()
    })
  })

  describe('Values Section', () => {
    it('should render values heading', () => {
      renderWithRouter(<HomePage />)

      expect(
        screen.getByRole('heading', { name: /our core values/i, level: 2 })
      ).toBeInTheDocument()
    })

    it('should render all core values', () => {
      renderWithRouter(<HomePage />)

      expect(screen.getByText('Excellence')).toBeInTheDocument()
      expect(screen.getByText('Collaboration')).toBeInTheDocument()
      expect(screen.getByText('Innovation')).toBeInTheDocument()
    })

    it('should render hero image with alt text', () => {
      renderWithRouter(<HomePage />)

      expect(screen.getByAltText(/students collaborating in a classroom/i)).toBeInTheDocument()
    })
  })

  describe('Contact Section', () => {
    it('should render contact heading', () => {
      renderWithRouter(<HomePage />)

      expect(
        screen.getByRole('heading', { name: /contact our school/i, level: 2 })
      ).toBeInTheDocument()
    })

    it('should render contact address', () => {
      renderWithRouter(<HomePage />)

      expect(screen.getByText('Jl. Raya No. 123, Jakarta, Indonesia')).toBeInTheDocument()
    })

    it('should render contact phone', () => {
      renderWithRouter(<HomePage />)

      expect(screen.getByText('(021) 123-4567')).toBeInTheDocument()
    })

    it('should render contact email', () => {
      renderWithRouter(<HomePage />)

      expect(screen.getByText('info@akademiapro.sch.id')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-labelledby on hero section', () => {
      renderWithRouter(<HomePage />)

      const heroSection = document.querySelector('section[aria-labelledby="hero-heading"]')
      expect(heroSection).toBeInTheDocument()
    })

    it('should have proper aria-labelledby on features section', () => {
      renderWithRouter(<HomePage />)

      const featuresSection = document.querySelector('section[aria-labelledby="features-heading"]')
      expect(featuresSection).toBeInTheDocument()
    })

    it('should have proper aria-labelledby on values section', () => {
      renderWithRouter(<HomePage />)

      const valuesSection = document.querySelector('section[aria-labelledby="values-heading"]')
      expect(valuesSection).toBeInTheDocument()
    })

    it('should have proper aria-labelledby on contact section', () => {
      renderWithRouter(<HomePage />)

      const contactSection = document.querySelector('section[aria-labelledby="contact-heading"]')
      expect(contactSection).toBeInTheDocument()
    })
  })
})
