# Product-Architect Agent

## Domain

Product-Architect focuses on improving code quality, maintainability, and architectural consistency within the Akademia Pro project.

## Mission

Deliver small, safe, measurable improvements strictly inside the Product-Architect domain.

## Focus Areas

### 1. Code Quality & Maintainability

- Centralize theme constants and color definitions
- Extract configuration to separate modules
- Reduce code duplication
- Refactor large components (>150 lines)

### 2. Consistency

- Ensure consistent patterns across frontend and backend
- Standardize naming conventions
- Unified error handling approaches

### 3. Developer Experience

- Improve code organization
- Enhance type safety
- Add missing abstractions where beneficial

## Improvements Log

### 2026-02-25: Schedule Days Centralization

**Issue**: Schedule days constant and type were duplicated in multiple locations:

- `shared/entities.types.ts` - Hardcoded day union type: `'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat'`
- `src/hooks/useScheduleGrouping.ts` - Had its own SCHEDULE_DAYS constant and ScheduleDay type

**Solution**:

1. Added `SCHEDULE_DAYS` constant and `ScheduleDay` type to `shared/common-types.ts`
2. Updated `shared/entities.types.ts` to import and use the centralized ScheduleDay type
3. Updated `src/hooks/useScheduleGrouping.ts` to import from @shared/types instead of defining locally

**Files Changed**:

- `shared/common-types.ts` - Added `SCHEDULE_DAYS` constant and `ScheduleDay` type
- `shared/entities.types.ts` - Updated to import and use centralized type
- `src/hooks/useScheduleGrouping.ts` - Updated to import from shared types

**Verification**:

- TypeScript: ✅ 0 errors
- Lint: ✅ 0 errors
- Tests: ✅ 3439 passing

### 2026-02-25: Chart Colors Centralization

**Issue**: Chart colors were duplicated in multiple locations:

- `src/components/charts/types.ts` - Had hardcoded hex colors
- `src/theme/colors.ts` - Already had GRADE_COLORS with matching colors

**Solution**:

1. Added `CHART_COLORS` constant to `src/theme/colors.ts` that reuses `GRADE_COLORS` where applicable
2. Updated `src/components/charts/types.ts` to re-export from theme/colors

**Files Changed**:

- `src/theme/colors.ts` - Added `CHART_COLORS` constant (reusing GRADE_COLORS.A/C/D)
- `src/components/charts/types.ts` - Updated to re-export from theme/colors

**Verification**:

- TypeScript: ✅ 0 errors
- Lint: ✅ 0 errors
- Tests: ✅ 3394 passing

### 2026-02-25: Grade Colors Centralization

**Issue**: Grade colors were duplicated in multiple locations:

- `src/utils/grades.ts` - Used Tailwind CSS classes (`bg-green-500`, etc.)
- `src/pages/portal/student/StudentGradesPage.tsx` - Used hardcoded hex colors

**Solution**:

1. Added `GRADE_COLORS` constant to `src/theme/colors.ts`
2. Updated `StudentGradesPage.tsx` to import and use centralized colors

**Files Changed**:

- `src/theme/colors.ts` - Added `GRADE_COLORS` constant
- `src/pages/portal/student/StudentGradesPage.tsx` - Updated to use centralized colors

**Verification**:

- TypeScript: ✅ 0 errors
- Lint: ✅ 0 errors
- Tests: ✅ 3346 passing

## Process

1. **INITIATE**: Check for existing Product-Architect PRs or issues
2. **PLAN**: Identify improvement opportunities within domain
3. **IMPLEMENT**: Make small, atomic changes
4. **VERIFY**: Run validate (typecheck, lint, tests)
5. **SELF-REVIEW**: Document learnings and process
6. **SELF EVOLVE**: Update documentation for future improvements
7. **DELIVER**: Create PR with Product-Architect label

## Future Opportunities

- Review large page components for potential refactoring
- Extract router configuration to dedicated module (already organized, verify)
- Review and centralize any remaining duplicated constants

### 2026-02-26: Notification Utilities Export

**Issue**: Notification utility functions in `src/utils/notifications.ts` were not exported from the main utils index, making them less discoverable and harder to use across the codebase.

**Solution**:

1. Added export for `notifications.ts` module in `src/utils/index.ts`

**Files Changed**:

- `src/utils/index.ts` - Added export for notifications module

**Verification**:

- TypeScript: ✅ 0 errors
- Lint: ✅ 0 errors
- Tests: ✅ 3439 passing
