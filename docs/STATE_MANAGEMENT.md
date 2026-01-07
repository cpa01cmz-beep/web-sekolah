# State Management Guidelines

## Overview

This document establishes consistent state management patterns and best practices for Akademia Pro. Following these guidelines ensures maintainable, performant, and scalable frontend code.

---

## State Management Strategy

### Three-Layer State Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     UI/Component State                         │
│                     (Local useState, refs)                     │
│                   - Form inputs, UI toggles                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Global Application State                     │
│                     (Zustand stores)                           │
│                   - Auth, theme, user preferences              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Server State                              │
│                   (React Query)                                │
│                   - API data, caching, sync                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: UI/Component State

**Use Case**: Local component state that doesn't need to be shared
- Form inputs
- UI toggles (dropdowns, modals, tabs)
- Temporary calculations
- Derived state from props

**Implementation**: Use `useState`, `useReducer`, `useRef`

### When to Use

✅ **DO use** for:
- Form field values (`name`, `email`, `password`)
- UI visibility states (`isOpen`, `isLoading`, `showModal`)
- Local component flags (`isEditing`, `selectedItem`)
- Temporary calculations or transformations

❌ **DO NOT use** for:
- Data that needs to be shared across components (use Zustand)
- Data that needs to persist across page reloads (use localStorage + Zustand)
- Server-fetched data (use React Query)
- Authentication state (use `useAuthStore`)

### Example

```typescript
// ✅ Good: Local UI state
function StudentForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await studentService.create({ name, email });
    setIsSubmitting(false);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}

// ❌ Bad: Global state in component (should use Zustand)
function Navigation() {
  const [currentUser, setCurrentUser] = useState<User | null>(null); // Wrong!
  // Should use: const user = useAuthStore(state => state.user);
}
```

---

## Layer 2: Global Application State (Zustand)

**Use Case**: Application-wide state that needs to be shared across components
- Authentication state
- User preferences (theme, language)
- Application settings
- Cross-component shared state

### Current Zustand Stores

| Store | Purpose | Persistence |
|-------|---------|-------------|
| `useAuthStore` | Authentication state | localStorage |

### Creating New Zustand Stores

Follow this pattern:

```typescript
// src/stores/newStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NewStoreState {
  data: SomeType | null;
  setData: (data: SomeType) => void;
  clearData: () => void;
}

export const useNewStore = create<NewStoreState>((set) => ({
  data: null,
  setData: (data) => set({ data }),
  clearData: () => set({ data: null }),
}));

// With persistence (if needed)
import { persist } from 'zustand/middleware';

export const useNewStore = create<NewStoreState>()(
  persist(
    (set) => ({
      data: null,
      setData: (data) => set({ data }),
      clearData: () => set({ data: null }),
    }),
    {
      name: 'new-storage', // localStorage key
    }
  )
);
```

### Store Organization

Place all stores in `src/stores/` directory:
```
src/stores/
  authStore.ts
  userPreferencesStore.ts
  notificationsStore.ts
  index.ts (export all)
```

### Zustand Best Practices

✅ **DO**:
- Use selectors for optimal re-renders: `const user = useAuthStore(state => state.user)`
- Keep actions in the store, not in components
- Use TypeScript interfaces for type safety
- Consider `persist` middleware for state that should survive page reloads

❌ **DO NOT**:
- Store server data in Zustand (use React Query)
- Put business logic in stores (put in service layer)
- Use Zustand for form inputs (use local state)
- Create multiple stores for related state (combine into one)

### Example Usage

```typescript
// ✅ Good: Using selectors to prevent unnecessary re-renders
function UserProfile() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return <div>{user?.name} <button onClick={logout}>Logout</button></div>;
}

// ✅ Good: Multiple selectors from same store
function Header() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.token !== null);

  if (!isAuthenticated) return <LoginButton />;
  return <UserProfile />;
}

// ❌ Bad: Storing entire store causes re-renders on all changes
function UserProfile() {
  const authStore = useAuthStore(); // Wrong! Entire store
  // Changes to any field will cause re-render
}
```

---

## Layer 3: Server State (React Query)

**Use Case**: Data fetched from APIs that needs caching, synchronization, and automatic refetching
- User data (dashboard, grades, schedule)
- Lists of items (students, classes, courses)
- Any data that changes on the server

### Current React Query Hooks

| Hook | Purpose | Cache Time |
|------|---------|------------|
| `useStudentDashboard` | Student dashboard data | 5 min (stale), 24h (gc) |
| `useStudentGrades` | Student grades | 30 min (stale), 24h (gc) |
| `useStudentSchedule` | Student schedule | 1 hour (stale), 24h (gc) |
| `useStudentCard` | Student card data | 24h (stale), 7d (gc) |

### Creating New React Query Hooks

Follow this pattern:

```typescript
// src/hooks/useNewData.ts
import { useQuery as useTanstackQuery, UseQueryOptions } from '@tanstack/react-query';
import { newService } from '@/services/newService';
import type { NewDataType } from '@shared/types';
import { CachingTime } from '@/config/time';

export function useNewData(id: string, options?: UseQueryOptions<NewDataType>) {
  return useTanstackQuery({
    queryKey: ['newData', id], // Cache key
    queryFn: () => newService.getData(id),
    enabled: !!id,
    staleTime: CachingTime.FIVE_MINUTES,
    gcTime: CachingTime.TWENTY_FOUR_HOURS,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    ...options,
  });
}
```

### Cache Time Guidelines

| Data Type | staleTime | gcTime | Example |
|-----------|-----------|---------|---------|
| Highly dynamic (real-time) | 1-5 min | 1-2 hours | Dashboard widgets, notifications |
| Semi-dynamic | 15-30 min | 24 hours | Grades, class lists |
| Rarely changes | 1-24 hours | 7 days | User profile, school info |
| Never changes | 24 hours | 7-30 days | Static configurations |

### React Query Best Practices

✅ **DO**:
- Use descriptive query keys: `['students', studentId, 'grades']`
- Set appropriate `staleTime` for each data type
- Use `enabled` to conditionally fetch data
- Handle loading and error states properly
- Invalidate cache on mutations: `queryClient.invalidateQueries(['students'])`

❌ **DO NOT**:
- Manually store API data in Zustand (React Query handles this)
- Set `staleTime` to 0 for everything (causes excessive refetching)
- Use React Query for form inputs (use local state)
- Ignore error states and loading states
- Cache sensitive data in browser storage

### Example Usage

```typescript
// ✅ Good: Proper React Query usage
function StudentDashboard() {
  const { data, isLoading, error } = useStudentDashboard(studentId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;

  return <DashboardView data={data} />;
}

// ✅ Good: Mutation with cache invalidation
function UpdateGradeForm({ gradeId }) {
  const mutation = useMutation({
    mutationFn: (data: UpdateGradeData) =>
      teacherService.updateGrade(gradeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['students', studentId, 'grades']);
      toast.success('Grade updated successfully');
    },
  });

  return <form onSubmit={(e) => mutation.mutate(...)}>...</form>;
}

// ❌ Bad: Manually managing API data in Zustand
function StudentDashboard() {
  const [grades, setGrades] = useState([]); // Wrong!
  useEffect(() => {
    fetchGrades().then(setGrades);
  }, []);
  // React Query handles this automatically
}
```

---

## Decision Tree

```
Need to store state?
│
├─ Is it form input or UI toggle? → Local useState ✅
│
├─ Is it data from API?
│  ├─ Does it need caching and sync? → React Query ✅
│  └─ Is it rarely changing static data? → React Query with long cache ✅
│
├─ Is it global application state?
│  ├─ Authentication? → useAuthStore ✅
│  ├─ User preferences (theme, language)? → Zustand ✅
│  └─ Cross-component shared state? → Zustand ✅
│
└─ Is it derived data? → useMemo ✅
```

---

## Anti-Patterns to Avoid

### 1. Storing API Data in Multiple Places

```typescript
// ❌ BAD: API data in both React Query and Zustand
const { data } = useStudentData(id);
const [localData, setLocalData] = useState(); // Duplicate!
// Use only React Query for API data
```

### 2. Using Local State for Global Settings

```typescript
// ❌ BAD: Theme as local state in multiple components
function Header() {
  const [isDark, setIsDark] = useState(false);
}

function Footer() {
  const [isDark, setIsDark] = useState(false); // Not synchronized!
}

// ✅ GOOD: Single source of truth
function Header() {
  const { isDark, toggleTheme } = useThemeStore();
}
```

### 3. Ignoring Loading/Error States

```typescript
// ❌ BAD: No loading/error handling
function StudentList() {
  const { data } = useStudents();
  return <ul>{data.map(...)}</ul>; // Crashes if data is undefined!
}

// ✅ GOOD: Handle all states
function StudentList() {
  const { data, isLoading, error } = useStudents();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage />;
  if (!data) return <EmptyState />;

  return <ul>{data.map(...)}</ul>;
}
```

### 4. Invalidating Too Much Cache

```typescript
// ❌ BAD: Invalidates everything
mutation.mutate(data, {
  onSuccess: () => {
    queryClient.invalidateQueries(); // Wastes bandwidth
  },
});

// ✅ GOOD: Targeted invalidation
mutation.mutate(data, {
  onSuccess: () => {
    queryClient.invalidateQueries(['students', studentId, 'grades']);
  },
});
```

### 5. Mixing State Concerns

```typescript
// ❌ BAD: Zustand store with API fetching
const useStudentStore = create((set) => ({
  student: null,
  fetchStudent: async (id) => {
    const data = await studentService.get(id); // API call in store
    set({ student: data });
  },
}));

// ✅ GOOD: Zustand for state, React Query for data
const { data } = useStudent(id); // React Query handles fetching
```

---

## Performance Optimization

### 1. Use Selectors for Zustand

```typescript
// ❌ BAD: Entire store selected
const store = useAuthStore(); // Re-renders on ANY change

// ✅ GOOD: Select only needed state
const user = useAuthStore((state) => state.user); // Re-renders only on user change
```

### 2. Memoize Derived Data

```typescript
function GradeSummary({ grades }) {
  const average = useMemo(() => {
    return grades.reduce((sum, g) => sum + g.score, 0) / grades.length;
  }, [grades]);

  return <div>Average: {average}</div>;
}
```

### 3. Debounce Form Inputs

```typescript
import { useDebouncedValue } from '@/hooks/useDebounce';

function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      searchStudents(debouncedQuery);
    }
  }, [debouncedQuery]);
}
```

---

## Testing State Management

### Testing Local State

```typescript
test('form submission', () => {
  const { result } = renderHook(() => useStudentForm());
  act(() => {
    result.current.setName('John Doe');
    result.current.setEmail('john@example.com');
  });
  expect(result.current.name).toBe('John Doe');
});
```

### Testing Zustand Stores

```typescript
import { useAuthStore } from '@/stores/authStore';

test('login updates store', () => {
  const { result } = renderHook(() => useAuthStore());
  act(() => {
    result.current.login(email, password, role);
  });
  expect(result.current.user).toBeTruthy();
});
```

### Testing React Query Hooks

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

test('fetches student data', async () => {
  const { result } = renderHook(() => useStudentData('id'), {
    wrapper: createWrapper(),
  });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toEqual(expectedData);
});
```

---

## Monitoring and Debugging

### React Query DevTools

Install and enable React Query DevTools:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Zustand DevTools

Add Zustand devtools middleware:

```typescript
import { devtools } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      // ... store implementation
    }),
    { name: 'AuthStore' }
  )
);
```

### Monitoring Tips

1. **Check cache hit rate**: High cache hit rate = good, low = check staleTime
2. **Watch re-renders**: Use React DevTools Profiler to identify unnecessary re-renders
3. **Monitor bundle size**: Ensure state management libraries don't bloat the bundle
4. **Track API calls**: Too many API calls? Increase staleTime or use refetchOnMount: false

---

## Migration Guide

### Converting Local State to Zustand

**Before**:
```typescript
// Component A
const [theme, setTheme] = useState('light');

// Component B
const [theme, setTheme] = useState('light'); // Duplicated!
```

**After**:
```typescript
// src/stores/themeStore.ts
export const useThemeStore = create((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}));

// Component A
const { theme, setTheme } = useThemeStore();

// Component B
const { theme, setTheme } = useThemeStore(); // Shared!
```

### Converting Manual Fetch to React Query

**Before**:
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  fetchData().then((result) => {
    setData(result);
    setLoading(false);
  });
}, []);
```

**After**:
```typescript
const { data, isLoading } = useData();

// No need for useEffect, useState, error handling - React Query handles it
```

---

## Checklist for New Features

When adding a new feature, ask:

- [ ] Is this UI state? → Use `useState`/`useReducer`
- [ ] Is this global state? → Use Zustand store
- [ ] Is this API data? → Use React Query
- [ ] Does it need persistence? → Add localStorage/zustand persist middleware
- [ ] Are selectors used for optimal performance? → Check Zustand usage
- [ ] Is cache time appropriate for data type? → Set staleTime/gcTime
- [ ] Are loading/error states handled? → Add proper UI
- [ ] Is cache invalidated correctly on mutations? → Add queryClient.invalidateQueries
- [ ] Are anti-patterns avoided? → Review decision tree
- [ ] Are tests added? → Test hooks and stores

---

## Related Documentation

- [API Blueprint](./blueprint.md) - API endpoints and integration patterns
- [React Query Docs](https://tanstack.com/query/latest) - Official React Query documentation
- [Zustand Docs](https://zustand-demo.pmnd.rs/) - Official Zustand documentation
- [Task List](./task.md) - Architectural refactoring tasks

---

## Summary

| State Type | Tool | When to Use | Persistence |
|------------|------|-------------|-------------|
| UI/Component | useState, useReducer | Local form inputs, UI toggles | No |
| Global App | Zustand | Auth, theme, cross-component state | Optional (localStorage) |
| Server Data | React Query | API data, cached lists | Yes (in-memory cache) |
| Derived | useMemo | Calculated from other state | No |

**Key Principles**:
1. ✅ Single source of truth for each piece of state
2. ✅ Choose the right tool for the job (decision tree)
3. ✅ Avoid anti-patterns (duplicate state, mixing concerns)
4. ✅ Optimize for performance (selectors, memoization)
5. ✅ Handle all states (loading, error, success, empty)
6. ✅ Test state management (hooks, stores, mutations)
