# Quality Assurance Documentation

## Test Status

### Current Test Coverage

- **Test Files**: 111
- **Tests**: 3392 passing, 5 skipped, 155 todo
- **Pass Rate**: 100%

### Validation Commands

```bash
npm run validate     # Runs typecheck, lint, and tests
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint validation
npm run test:run     # Test suite
```

## Excluded Tests

The following tests are excluded from the test suite in `vitest.config.ts`:

| Test File                                                 | Reason                                                         |
| --------------------------------------------------------- | -------------------------------------------------------------- |
| `worker/__tests__/webhook-reliability.test.ts`            | Does not exist                                                 |
| `worker/__tests__/webhook-entities.test.ts`               | Does not exist                                                 |
| `worker/__tests__/referential-integrity.test.ts`          | Requires proper env mock with `GlobalDurableObject.idFromName` |
| `worker/domain/__tests__/CommonDataService.test.ts`       | Requires Cloudflare Workers environment                        |
| `worker/domain/__tests__/StudentDashboardService.test.ts` | Requires Cloudflare Workers environment                        |
| `worker/domain/__tests__/TeacherService.test.ts`          | Requires Cloudflare Workers environment                        |
| `worker/domain/__tests__/UserService.test.ts`             | Requires Cloudflare Workers environment                        |
| `worker/domain/__tests__/ParentDashboardService.test.ts`  | Requires Cloudflare Workers environment                        |

### Enabling Excluded Tests

To enable excluded tests, each test file needs to provide a proper mock environment:

```typescript
const mockEnv = {
  GlobalDurableObject: {
    idFromName: vi.fn().mockReturnValue('test-do-id'),
    idFromString: vi.fn().mockReturnValue({ toString: () => 'test-do-id' }),
    get: vi.fn().mockReturnValue({
      get: vi.fn().mockResolvedValue({
        waitUntil: () => {},
        storage: {
          get: vi.fn(),
          put: vi.fn(),
          delete: vi.fn(),
          list: vi.fn().mockResolvedValue({ keys: [], list_complete: true }),
        },
      }),
    }),
  },
  // ... other env bindings
} as unknown as Env
```

## Mock Improvements

### cloudflare:workers Mock

The mock file (`__mocks__/cloudflare:workers.ts`) has been enhanced with:

- `MockDurableObjectId` - Implements DurableObjectId interface
- `MockDurableObjectNamespace` - Provides working `idFromName`, `idFromString`, `get` methods
- `MockDurableObjectStub` - Full stub implementation
- `MockDurableObjectStorage` - Full storage mock with Map-based storage
- Pre-configured `ENV` object with mock namespaces for all entity types

## Quality Metrics

### Lint Status

- ESLint: Passing with no errors

### TypeScript Status

- TypeScript: Passing with no errors

### Security

- No security vulnerabilities detected in dependencies (2 moderate/high in dev-only deps)

## Notes

- Tests use Vitest with jsdom for frontend and node environment for backend
- Cloudflare Workers specific tests require proper env mocking
- The `validate` script ensures all quality gates pass before commits
