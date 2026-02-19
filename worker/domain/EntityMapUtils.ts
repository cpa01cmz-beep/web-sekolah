export type EntityWithId = { id: string };

export type EntityWithPassword = { passwordHash?: string | null };

export function removePassword<T extends EntityWithPassword>(entity: T): Omit<T, 'passwordHash'> {
  const { passwordHash: _, ...rest } = entity;
  return rest;
}

export function getUniqueIds(ids: string[]): string[] {
  return Array.from(new Set(ids));
}

export function buildEntityMap<T extends EntityWithId>(entities: (T | null)[]): Map<string, T> {
  return new Map(entities.filter((e): e is T => e !== null).map(e => [e.id, e]));
}

export async function fetchAndMap<T extends EntityWithId>(
  ids: string[],
  fetcher: (id: string) => Promise<T | null>
): Promise<Map<string, T>> {
  const entities = await Promise.all(ids.map(fetcher));
  return buildEntityMap(entities);
}
