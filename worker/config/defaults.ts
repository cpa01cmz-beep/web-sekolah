export const DefaultOrigins = {
  LOCAL_DEV: ['http://localhost:3000', 'http://localhost:4173'] as const,
};

export type DefaultOrigin = 'http://localhost:3000' | 'http://localhost:4173';
