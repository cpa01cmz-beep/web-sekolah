# State Management Examples

This file provides practical examples demonstrating the state management guidelines from [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md).

---

## Example 1: Student Grade Management

Complete example showing all three state layers working together.

```typescript
// ====================
// Layer 1: UI State (Local Component)
// ====================

function GradeForm({ studentId }: { studentId: string }) {
  // ✅ Local UI state for form inputs
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  // ✅ Local UI state for loading/error
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Server state for grades (React Query)
  const { data: grades, isLoading: isLoadingGrades } = useStudentGrades(studentId);
  const { data: courses } = useCourses();

  // ✅ Mutation for creating grades
  const createGradeMutation = useMutation({
    mutationFn: (data: CreateGradeData) =>
      teacherService.createGrade(data),
    onSuccess: () => {
      // Invalidate cache to refetch grades
      queryClient.invalidateQueries(['students', studentId, 'grades']);
      toast.success('Grade created successfully');
      setScore(0);
      setFeedback('');
    },
    onError: (err) => {
      setError('Failed to create grade');
    },
  });

  // ✅ Local UI state handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!isValidScore(score)) {
      setError('Score must be between 0 and 100');
      setIsSubmitting(false);
      return;
    }

    createGradeMutation.mutate(
      { studentId, courseId: courses[0].id, score, feedback },
      {
        onSettled: () => setIsSubmitting(false),
      }
    );
  };

  // ✅ Derived state using useMemo
  const averageGrade = useMemo(() => {
    if (!grades || grades.length === 0) return 0;
    return grades.reduce((sum, g) => sum + g.score, 0) / grades.length;
  }, [grades]);

  if (isLoadingGrades) return <Skeleton />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      {/* ✅ Local UI state for toggles */}
      <Button onClick={() => setShowPreview(!showPreview)}>
        {showPreview ? 'Hide' : 'Show'} Preview
      </Button>

      {showPreview && <GradePreview average={averageGrade} grades={grades} />}

      <form onSubmit={handleSubmit}>
        <Input
          type="number"
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          min={0}
          max={100}
        />
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Grade'}
        </Button>
      </form>
    </div>
  );
}
```

---

## Example 2: Theme Management (Zustand)

Creating and using a Zustand store for global theme state.

```typescript
// ====================
// Layer 2: Global App State (Zustand)
// ====================

// src/stores/themeStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  primaryColor: string;
  setTheme: (isDark: boolean) => void;
  setPrimaryColor: (color: string) => void;
  toggleTheme: () => void;
}

/**
 * Zustand store for theme management
 * Persists theme preference to localStorage
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: false,
      primaryColor: 'blue',

      setTheme: (isDark) => set({ isDark }),

      setPrimaryColor: (primaryColor) => set({ primaryColor }),

      toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
    }),
    {
      name: 'theme-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist specific fields
      partialize: (state) => ({
        isDark: state.isDark,
        primaryColor: state.primaryColor,
      }),
    }
  )
);

// ✅ Usage in components
function ThemeToggle() {
  // ✅ Select only needed state (optimal re-renders)
  const isDark = useThemeStore((state) => state.isDark);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <button onClick={toggleTheme}>
      Switch to {isDark ? 'Light' : 'Dark'} Mode
    </button>
  );
}

function ColorPicker() {
  // ✅ Select only needed state
  const primaryColor = useThemeStore((state) => state.primaryColor);
  const setPrimaryColor = useThemeStore((state) => state.setPrimaryColor);

  return (
    <select
      value={primaryColor}
      onChange={(e) => setPrimaryColor(e.target.value)}
    >
      <option value="blue">Blue</option>
      <option value="green">Green</option>
      <option value="purple">Purple</option>
    </select>
  );
}

// ✅ Apply theme at root level
function App() {
  const isDark = useThemeStore((state) => state.isDark);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return <AppContent />;
}
```

---

## Example 3: Student Dashboard (React Query)

Using React Query for server state management with proper caching.

```typescript
// ====================
// Layer 3: Server State (React Query)
// ====================

// src/hooks/useStudentDashboard.ts
import { useQuery as useTanstackQuery, UseQueryOptions } from '@tanstack/react-query';
import { studentService } from '@/services/studentService';
import type { StudentDashboardData } from '@shared/types';
import { CachingTime } from '@/config/time';

export function useStudentDashboard(
  studentId: string,
  options?: UseQueryOptions<StudentDashboardData>
) {
  return useTanstackQuery({
    // ✅ Descriptive query key for cache
    queryKey: ['students', studentId, 'dashboard'],
    queryFn: () => studentService.getDashboard(studentId),
    // ✅ Conditional fetching
    enabled: !!studentId,
    // ✅ Appropriate cache time for dashboard data
    staleTime: CachingTime.FIVE_MINUTES, // Consider stale after 5 minutes
    gcTime: CachingTime.TWENTY_FOUR_HOURS, // Keep in cache for 24 hours
    // ✅ Smart refetch behavior
    refetchOnWindowFocus: false, // Don't refetch on tab switch
    refetchOnMount: false, // Don't refetch if data is fresh
    refetchOnReconnect: true, // Refetch when internet reconnects
    ...options,
  });
}

// ✅ Usage in component
function StudentDashboardPage() {
  const { user } = useAuthStore((state) => state.user); // Zustand for auth state

  const {
    data: dashboard,
    isLoading,
    error,
    isError,
    refetch,
  } = useStudentDashboard(user?.id || '');

  // ✅ Handle all states
  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <ErrorView error={error} onRetry={() => refetch()} />;
  if (!dashboard) return <EmptyState />;

  return (
    <div>
      {/* Display dashboard data */}
      <GPAOverview grades={dashboard.grades} />
      <RecentAnnouncements announcements={dashboard.announcements} />
      <UpcomingSchedule schedule={dashboard.schedule} />
    </div>
  );
}
```

---

## Example 4: Mutation with Cache Invalidation

Proper pattern for data mutations with React Query.

```typescript
function UpdateGradeModal({ grade, onClose }: { grade: Grade; onClose: () => void }) {
  const [score, setScore] = useState(grade.score);
  const [feedback, setFeedback] = useState(grade.feedback || '');

  const queryClient = useQueryClient();

  // ✅ Mutation with proper cache invalidation
  const updateGradeMutation = useMutation({
    mutationFn: (data: UpdateGradeData) =>
      teacherService.updateGrade(grade.id, data),

    // ✅ Optimistic update (optional, for better UX)
    onMutate: async (newData) => {
      await queryClient.cancelQueries(['students', grade.studentId, 'grades']);

      const previousGrades = queryClient.getQueryData<Grade[]>([
        'students',
        grade.studentId,
        'grades',
      ]);

      queryClient.setQueryData<Grade[]>(
        ['students', grade.studentId, 'grades'],
        (old = []) =>
          old.map((g) =>
            g.id === grade.id ? { ...g, ...newData } : g
          )
      );

      return { previousGrades };
    },

    // ✅ Rollback on error
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ['students', grade.studentId, 'grades'],
        context?.previousGrades
      );
      toast.error('Failed to update grade');
    },

    // ✅ Invalidate cache on success
    onSuccess: () => {
      queryClient.invalidateQueries(['students', grade.studentId, 'grades']);
      toast.success('Grade updated successfully');
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateGradeMutation.mutate({ score, feedback });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Grade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            type="number"
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
          />
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <Button type="submit" disabled={updateGradeMutation.isPending}>
            {updateGradeMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Example 5: Anti-Patterns (What NOT to Do)

### ❌ Anti-Pattern 1: Storing API Data in Zustand

```typescript
// ❌ BAD: API data in Zustand store
const useStudentStore = create((set) => ({
  student: null,
  grades: [],

  // API call in store - WRONG!
  fetchStudent: async (id) => {
    const data = await api.get(`/students/${id}`);
    set({ student: data });
  },

  fetchGrades: async (studentId) => {
    const data = await api.get(`/students/${studentId}/grades`);
    set({ grades: data });
  },
}));

// ✅ GOOD: Use React Query for API data
const { data: student } = useStudent(id);
const { data: grades } = useStudentGrades(id);
```

### ❌ Anti-Pattern 2: Duplicating State

```typescript
// ❌ BAD: Same state in multiple places
function StudentProfile() {
  const [student, setStudent] = useState(null); // Local state
  const { data } = useStudent(id); // React Query
  // Now you have two sources of truth!
}

// ✅ GOOD: Single source of truth
function StudentProfile() {
  const { data: student } = useStudent(id);
  return <ProfileView student={student} />;
}
```

### ❌ Anti-Pattern 3: Ignoring Loading/Error States

```typescript
// ❌ BAD: No error handling
function StudentList() {
  const { data } = useStudents();
  return <ul>{data.map(...)}</ul>; // Crashes if undefined!
}

// ✅ GOOD: Handle all states
function StudentList() {
  const { data, isLoading, error, isError } = useStudents();

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage error={error} />;
  if (!data || data.length === 0) return <EmptyState />;

  return <ul>{data.map(...)}</ul>;
}
```

### ❌ Anti-Pattern 4: Selecting Entire Store

```typescript
// ❌ BAD: Re-renders on ANY store change
function UserProfile() {
  const authStore = useAuthStore(); // Entire store
  return <div>{authStore.user?.name}</div>;
}

// ✅ GOOD: Select only needed state
function UserProfile() {
  const user = useAuthStore((state) => state.user); // Only user
  return <div>{user?.name}</div>;
}
```

---

## Example 6: Complex Component with All State Layers

Complete example showing when to use each state type.

```typescript
function StudentManagementPage() {
  // ==================== Global State (Zustand) ====================
  const { user } = useAuthStore((state) => state.user);
  const { isDark } = useThemeStore((state) => state.isDark);

  // ==================== Server State (React Query) ====================
  const { data: students, isLoading: isLoadingStudents } = useStudents();
  const { data: classes } = useClasses();
  const { data: courses } = useCourses();

  // ==================== Local UI State ====================
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // ==================== Derived State ====================
  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass =
        !selectedClassId || student.classId === selectedClassId;
      return matchesSearch && matchesClass;
    });
  }, [students, searchQuery, selectedClassId]);

  // ==================== Mutations ====================
  const createStudentMutation = useMutation({
    mutationFn: (data: CreateStudentData) =>
      adminService.createStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
      setShowAddModal(false);
      toast.success('Student created');
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudentData }) =>
      adminService.updateStudent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
      setEditingStudent(null);
      toast.success('Student updated');
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
      toast.success('Student deleted');
    },
  });

  // ==================== Event Handlers ====================
  const handleAddStudent = (data: CreateStudentData) => {
    createStudentMutation.mutate(data);
  };

  const handleUpdateStudent = (data: UpdateStudentData) => {
    if (editingStudent) {
      updateStudentMutation.mutate({ id: editingStudent.id, data });
    }
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      deleteStudentMutation.mutate(id);
    }
  };

  // ==================== Rendering ====================
  if (isLoadingStudents) return <PageSkeleton />;

  return (
    <div className={isDark ? 'dark' : 'light'}>
      {/* Local UI state for filters */}
      <div className="filters">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search students..."
        />
        <ClassSelect
          value={selectedClassId}
          onChange={setSelectedClassId}
          classes={classes || []}
        />
      </div>

      {/* Local UI state for modals */}
      <Button onClick={() => setShowAddModal(true)}>Add Student</Button>

      {showAddModal && (
        <StudentFormModal
          classes={classes || []}
          courses={courses || []}
          onSubmit={handleAddStudent}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingStudent && (
        <StudentFormModal
          student={editingStudent}
          classes={classes || []}
          courses={courses || []}
          onSubmit={handleUpdateStudent}
          onClose={() => setEditingStudent(null)}
        />
      )}

      {/* Render filtered students */}
      <StudentTable
        students={filteredStudents}
        onEdit={setEditingStudent}
        onDelete={handleDeleteStudent}
      />
    </div>
  );
}
```

---

## Example 7: Testing State Management

### Testing Local State

```typescript
import { renderHook, act } from '@testing-library/react';

test('search filter works correctly', () => {
  const { result } = renderHook(() =>
    useStudentManagementHook()
  );

  const testStudents = [
    { name: 'John Doe', email: 'john@example.com' },
    { name: 'Jane Smith', email: 'jane@example.com' },
  ];

  act(() => {
    result.current.setSearchQuery('john');
  });

  expect(result.current.filteredStudents).toEqual([
    { name: 'John Doe', email: 'john@example.com' },
  ]);
});
```

### Testing Zustand Store

```typescript
import { act } from 'react';
import { renderHook } from '@testing-library/react';

test('theme toggle works', () => {
  const { result } = renderHook(() => useThemeStore());

  expect(result.current.isDark).toBe(false);

  act(() => {
    result.current.toggleTheme();
  });

  expect(result.current.isDark).toBe(true);
});

test('theme persists to localStorage', () => {
  const { result } = renderHook(() => useThemeStore());

  act(() => {
    result.current.setTheme(true);
  });

  expect(localStorage.getItem('theme-storage')).toContain('true');
});
```

### Testing React Query Hook

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { server } from '@/mocks/server';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

test('fetches student data successfully', async () => {
  const { result } = renderHook(
    () => useStudentData('student-1'),
    { wrapper: createWrapper() }
  );

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(result.current.data).toEqual(mockStudent);
});
```

---

## Summary

This example demonstrates:

1. **Local UI State**: Form inputs, modals, filters (useState)
2. **Global State**: Auth, theme (Zustand)
3. **Server State**: API data, caching (React Query)
4. **Derived State**: Computed values (useMemo)
5. **Proper Separation**: Each state type in its layer
6. **Testing**: All three layers tested

Key takeaways:
- ✅ Single source of truth for each data
- ✅ Right tool for the job
- ✅ Handle all states (loading, error, success, empty)
- ✅ Optimize performance with selectors and memoization
- ✅ Test all state management code
