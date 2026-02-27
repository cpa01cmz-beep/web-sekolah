export const EndpointTimeout = {
  QUERY: {
    FAST: 2000,
    STANDARD: 5000,
  },
  AGGREGATION: {
    STANDARD: 10000,
    COMPLEX: 15000,
  },
  WRITE: {
    FAST: 5000,
    STANDARD: 10000,
  },
  ADMIN: {
    STANDARD: 15000,
    COMPLEX: 30000,
  },
  SYSTEM: {
    REBUILD_INDEXES: 60000,
    SEED: 60000,
  },
  EXTERNAL: {
    WEBHOOK: 30000,
    DOCS: 30000,
  },
  HEALTH: {
    CHECK: 5000,
  },
} as const

export const ConnectionTimeout = {
  STANDARD: 5000,
  FAST: 2000,
} as const

export const TimeoutCategory = {
  AUTH: EndpointTimeout.QUERY.STANDARD,
  USER_GET: EndpointTimeout.QUERY.FAST,
  USER_LIST: EndpointTimeout.QUERY.STANDARD,
  USER_CREATE: EndpointTimeout.WRITE.STANDARD,
  USER_UPDATE: EndpointTimeout.WRITE.FAST,
  USER_DELETE: EndpointTimeout.WRITE.FAST,
  GRADE_GET: EndpointTimeout.QUERY.FAST,
  GRADE_CREATE: EndpointTimeout.WRITE.FAST,
  GRADE_UPDATE: EndpointTimeout.WRITE.FAST,
  DASHBOARD_TEACHER: EndpointTimeout.AGGREGATION.STANDARD,
  DASHBOARD_PARENT: EndpointTimeout.AGGREGATION.STANDARD,
  DASHBOARD_ADMIN: EndpointTimeout.AGGREGATION.STANDARD,
  ANNOUNCEMENT_GET: EndpointTimeout.QUERY.FAST,
  ANNOUNCEMENT_CREATE: EndpointTimeout.WRITE.FAST,
  WEBHOOK_CONFIG: EndpointTimeout.QUERY.STANDARD,
  WEBHOOK_DELIVERY: EndpointTimeout.QUERY.STANDARD,
  WEBHOOK_TRIGGER: EndpointTimeout.EXTERNAL.WEBHOOK,
  REBUILD_INDEXES: EndpointTimeout.SYSTEM.REBUILD_INDEXES,
  SEED: EndpointTimeout.SYSTEM.SEED,
  HEALTH: EndpointTimeout.HEALTH.CHECK,
} as const

export function getTimeoutForEndpoint(endpoint: keyof typeof TimeoutCategory): number {
  return TimeoutCategory[endpoint]
}

export function isFastQuery(timeout: number): boolean {
  return timeout <= EndpointTimeout.QUERY.STANDARD
}

export function isComplexOperation(timeout: number): boolean {
  return timeout >= EndpointTimeout.AGGREGATION.COMPLEX
}
