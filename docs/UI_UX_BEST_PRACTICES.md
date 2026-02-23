# UI/UX Best Practices and Keyboard Shortcuts

**Last Updated**: 2026-02-23  
**Version**: 1.2

---

## Accessibility (a11y) Overview

Akademia Pro follows WCAG 2.1 AA standards and best practices for inclusive design.

### Core Accessibility Features

- ✅ **Semantic HTML**: Proper use of landmarks (`nav`, `main`, `section`, `article`)
- ✅ **Keyboard Navigation**: All interactive elements are keyboard accessible
- ✅ **Screen Reader Support**: Comprehensive ARIA labels and descriptions
- ✅ **Focus Management**: Visible focus indicators and logical tab order
- ✅ **Reduced Motion**: Respects `prefers-reduced-motion` preference
- ✅ **Color Contrast**: WCAG AA compliant colors (see [COLOR_CONTRAST_VERIFICATION.md](./COLOR_CONTRAST_VERIFICATION.md))
- ✅ **Skip Links**: Allows keyboard users to skip navigation
- ✅ **Loading States**: Proper `aria-live` regions and `aria-busy` indicators
- ✅ **Error Handling**: Accessible error messages with `role="alert"` and `aria-live`

---

## Keyboard Shortcuts

### Global Navigation

| Key Combination       | Action                                                 | Availability         |
| --------------------- | ------------------------------------------------------ | -------------------- |
| `Tab` / `Shift + Tab` | Navigate forward/backward through interactive elements | Everywhere           |
| `Enter` / `Space`     | Activate buttons, links, and form controls             | Interactive elements |
| `Escape`              | Close modals, dialogs, and dropdowns                   | Modals, dropdowns    |
| `Home` / `End`        | Navigate to first/last item in lists                   | Lists, tables        |
| `Arrow Keys`          | Navigate within menus and grids                        | Menus, data grids    |

### Form Navigation

| Key Combination | Action                                    | Availability              |
| --------------- | ----------------------------------------- | ------------------------- |
| `Tab`           | Move to next form field                   | Forms                     |
| `Shift + Tab`   | Move to previous form field               | Forms                     |
| `Enter`         | Submit form (if focused on submit button) | Forms                     |
| `Space`         | Toggle checkboxes and radio buttons       | Checkboxes, radio buttons |

### Table Navigation

| Key Combination    | Action                | Availability    |
| ------------------ | --------------------- | --------------- |
| `Arrow Left/Right` | Move between columns  | Sortable tables |
| `Arrow Up/Down`    | Move between rows     | Tables          |
| `Home`             | Move to first row     | Tables          |
| `End`              | Move to last row      | Tables          |
| `Page Up/Down`     | Move up/down one page | Tables          |

---

## Design System Patterns

### Color Usage

**PRIMARY (#0D47A1)**:

- Use for: Text, headings, primary actions, important buttons
- WCAG AA: Compliant for all text sizes on light backgrounds
- Do NOT use for: Decorative elements, secondary actions

**SECONDARY (#00ACC1)**:

- Use for: Icons, badges, large text (18pt+), decorative elements
- WCAG AA: Compliant for large text and graphics only (3:1 minimum)
- Do NOT use for: Normal text (below 18pt), primary text on light backgrounds

**BACKGROUND (#F5F7FA)**:

- Use for: Page backgrounds, card backgrounds, section backgrounds
- Provides excellent contrast for dark text

### Typography Hierarchy

```tsx
// Headings
<h1 className="text-4xl font-bold">Page Title</h1>
<h2 className="text-3xl font-bold">Section Title</h2>
<h3 className="text-2xl font-semibold">Subsection Title</h3>

// Body Text
<p className="text-base">Regular body text</p>
<p className="text-sm text-muted-foreground">Secondary text</p>
<p className="text-xs">Small text</p>

// Interactive Text
<Link className="text-primary hover:underline">Link text</Link>
<button className="font-medium">Button text</button>
```

### Spacing System

```tsx
// Tailwind spacing scale (4px = 1 unit)
// 1: 4px, 2: 8px, 3: 12px, 4: 16px, 6: 24px, 8: 32px

className = 'p-4' // padding: 16px
className = 'gap-2' // gap: 8px
className = 'space-y-4' // vertical spacing: 16px between children
className = 'mt-6 mb-6' // margin-top: 24px, margin-bottom: 24px
```

### Component Patterns

#### Card Pattern

```tsx
<Card className="hover:shadow-lg transition-shadow duration-200">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>{/* Content */}</CardContent>
</Card>
```

#### Form Field Pattern

```tsx
<FormField id="email" label="Email" helperText="Enter your email address" required error={error}>
  <Input
    id="email"
    type="email"
    value={value}
    onChange={handleChange}
    aria-required="true"
    aria-invalid={!!error}
  />
</FormField>
```

#### Button Pattern

```tsx
<Button
  variant="default" // default | destructive | outline | secondary | ghost | link
  size="default" // default | sm | lg | icon
  disabled={isLoading}
  aria-busy={isLoading}
>
  {isLoading && <Loader2 className="animate-spin" />}
  Button Text
</Button>
```

#### Dashboard Stat Card Pattern

**Purpose**: Consistent display of statistics and metrics across dashboard pages (Admin, Teacher, Student, Parent).

**Accessibility**: Icons marked with `aria-hidden` for screen readers. Subtitles provide additional context.

```tsx
import { DashboardStatCard } from '@/components/dashboard/DashboardStatCard'

// Simple stat card (default valueSize: 2xl)
<DashboardStatCard
  title="Total Students"
  value={data.totalStudents.toString()}
  icon={<Users className="h-6 w-6 text-blue-500" />}
/>

// Complex stat card with subtitle and larger value
<DashboardStatCard
  title="Your Classes"
  value={data.totalClasses.toString()}
  icon={<BookCopy className="h-4 w-4 text-muted-foreground" />}
  subtitle={`Total students: ${data.totalStudents}`}
  valueSize="3xl"
/>
```

**Best Practices**:

- Use `valueSize="3xl"` for primary metrics (main dashboard numbers)
- Use `valueSize="2xl"` for secondary metrics (supporting statistics)
- Subtitles provide context (e.g., "Total students: 25")
- Icons use muted-foreground color for non-primary visual elements
- Consistent hover effects (`hover:shadow-lg`) across all stat cards

#### Dashboard Card Empty State Pattern

**Purpose**: Consistent empty state display within dashboard cards with optional icons.

**Accessibility**: Icon marked with `aria-hidden`. Uses `role="status"` for screen readers.

```tsx
import { DashboardCardEmptyState } from '@/components/dashboard/DashboardCardEmptyState'
import { FileX, Calendar, Bell } from 'lucide-react'

// Default with Inbox icon
<DashboardCardEmptyState message="No data available" />

// With custom icon for context
<DashboardCardEmptyState
  message="No grades recorded yet."
  icon={FileX}
/>
<DashboardCardEmptyState
  message="No schedule available."
  icon={Calendar}
/>
<DashboardCardEmptyState
  message="No announcements available."
  icon={Bell}
/>
```

**Best Practices**:

- Use contextually relevant icons for better visual feedback
- Default `Inbox` icon works well for general empty states
- Keep messages concise and informative
- Icon is optional - existing usages without icon continue to work

---

## Responsive Design Breakpoints

```tsx
// Tailwind default breakpoints
sm:  '640px'   // Small tablets
md:  '768px'   // Tablets
lg:  '1024px'  // Small laptops
xl:  '1280px'  // Desktops
2xl: '1536px'  // Large screens

// Example responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Items stack on mobile, 2 columns on tablet, 3 on desktop */}
</div>
```

### Mobile-First Approach

Always design for mobile first, then enhance for larger screens:

```tsx
// ✅ Good: Mobile-first
<div className="space-y-4 md:grid md:grid-cols-2 md:gap-4">
  {/* Mobile: stacked, Desktop: grid */}
</div>

// ❌ Avoid: Desktop-first with overrides
<div className="grid grid-cols-3 gap-4 md:block md:space-y-4">
  {/* Harder to maintain and test */}
</div>
```

---

## Loading States

### Skeleton Loading Pattern

```tsx
// Use TableSkeleton for tables
<TableSkeleton columns={4} rows={5} />

// Use DashboardSkeleton for dashboards
<DashboardSkeleton cards={3} />

// Use CardSkeleton for cards
<CardSkeleton lines={3} />
```

### Async Operations

```tsx
const [isLoading, setIsLoading] = useState(false)

// Button with loading state
;<Button onClick={handleAction} disabled={isLoading} aria-busy={isLoading}>
  {isLoading && <Loader2 className="animate-spin" aria-hidden="true" />}
  {isLoading ? 'Loading...' : 'Submit'}
</Button>
```

---

## Error Handling

### Form Validation

```tsx
const getError = () => {
  if (value === '') return 'This field is required'
  if (!/^\S+@\S+\.\S+$/.test(value)) return 'Please enter a valid email'
  return undefined
}

;<FormField error={getError()}>
  <Input
    aria-invalid={!!getError()}
    aria-describedby={getError() ? 'email-error' : 'email-helper'}
  />
</FormField>
```

### Error Boundaries

```tsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <YourComponent />
</ErrorBoundary>
```

### Toast Notifications

```tsx
import { toast } from 'sonner'

// Success
toast.success('Operation completed successfully')

// Error
toast.error('Something went wrong. Please try again.')

// Loading
toast.loading('Processing...', { duration: Infinity })
```

---

## Animation Guidelines

### Respect Reduced Motion

```tsx
import { useReducedMotion } from '@/hooks/use-reduced-motion'

function MyComponent() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <SlideUp delay={0.2} style={prefersReducedMotion ? { opacity: 1 } : {}}>
      {/* Content */}
    </SlideUp>
  )
}
```

### Animation Duration

- **Micro-interactions**: 150-200ms (button clicks, hover states)
- **Transitions**: 200-300ms (color changes, slide-ins)
- **Page transitions**: 300-500ms (route changes)
- **Complex animations**: 500-800ms (chart animations, data loading)

### Animation Types

```tsx
// Fade
className="animate-in fade-in-0 duration-200"

// Slide
className="animate-in slide-in-from-top-2 duration-200"

// Zoom
className="animate-in zoom-in-95 duration-200"

// Custom with reduced motion
style={prefersReducedMotion ? { transition: 'none' } : { transition: 'all 0.2s ease' }}
```

---

## Accessibility Testing Checklist

### Manual Testing

- [ ] **Keyboard Navigation**: Can you navigate the entire interface with keyboard only?
- [ ] **Focus Indicators**: Are focus states visible on all interactive elements?
- [ ] **Screen Reader**: Test with NVDA (Windows) or VoiceOver (Mac)
- [ ] **Color Contrast**: Verify text meets WCAG AA 4.5:1 ratio
- [ ] **Form Validation**: Are error messages announced to screen readers?
- [ ] **Loading States**: Do screen readers announce loading states?
- [ ] **Modal Focus**: Does focus trap inside modals?
- [ ] **Skip Links**: Can keyboard users skip to main content?
- [ ] **Image Alt Text**: Do all images have meaningful alt text?
- [ ] **Link Text**: Is link text descriptive (not "click here")?

### Automated Testing

```bash
# Run linter
npm run lint

# Run type checking
npm run typecheck

# Run tests
npm run test:run
```

### Browser Tools

- **Chrome DevTools**: Accessibility tab in Elements panel
- **Firefox DevTools**: Accessibility Inspector
- ** axe DevTools**: Browser extension for accessibility testing
- **WAVE**: WebAIM's accessibility evaluation tool

---

## Performance Guidelines

### Lazy Loading

```tsx
// Lazy load heavy components (charts, PDF generation)
const EnrollmentChart = lazy(() => import('@/components/charts/EnrollmentChart'))

// Use Suspense for loading state
;<Suspense fallback={<Skeleton />}>
  <EnrollmentChart data={data} />
</Suspense>
```

### Image Optimization

- Use WebP format for images
- Implement lazy loading for below-fold images
- Use responsive images with `srcset` and `sizes`
- Optimize image compression

---

## Internationalization (i18n) Considerations

### Future Implementation

- Support for RTL (right-to-left) languages
- Flexible text containers for varying text lengths
- Keyboard shortcuts localization
- Date/time formatting by locale
- Number formatting by locale

---

## Security Best Practices

### Input Handling

```tsx
// Use Zod schemas for validation
const emailSchema = z.string().email('Please enter a valid email')
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters')

// Never trust client-side validation only
// Always validate on the server
```

### XSS Prevention

- React automatically escapes JSX content
- Use `dangerouslySetInnerHTML` only when absolutely necessary
- Sanitize user-generated content before rendering

---

## Resources

### Documentation

- [Radix UI - Accessibility](https://www.radix-ui.com/docs/primitives/overview/accessibility)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Tailwind CSS Accessibility Guide](https://tailwindcss.com/blog/automating-accessibility)

### Tools

- axe DevTools: https://www.deque.com/axe/
- WAVE: https://wave.webaim.org/
- Lighthouse: Built into Chrome DevTools
- NVDA Screen Reader: https://www.nvaccess.org/

---

## Maintenance Guidelines

### When Adding New Components

1. Use semantic HTML elements
2. Add proper ARIA labels and descriptions
3. Ensure keyboard navigation works
4. Test with screen reader
5. Verify color contrast
6. Add loading and error states
7. Respect reduced motion preference

### When Modifying Existing Components

1. Maintain existing ARIA attributes
2. Preserve keyboard navigation patterns
3. Keep focus management intact
4. Test with assistive technologies
5. Update documentation if patterns change

---

**Document Maintainer**: UI/UX Engineer  
**Last Review**: 2026-02-23  
**Next Review**: 2026-03-23
