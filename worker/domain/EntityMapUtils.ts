export type EntityWithId = { id: string }

export function getUniqueIds(ids: string[]): string[] {
  return Array.from(new Set(ids))
}

export function buildEntityMap<T extends EntityWithId>(entities: (T | null)[]): Map<string, T> {
  const map = new Map<string, T>()
  for (const entity of entities) {
    if (entity !== null) {
      map.set(entity.id, entity)
    }
  }
  return map
}

export async function fetchAndMap<T extends EntityWithId>(
  ids: string[],
  fetcher: (id: string) => Promise<T | null>
): Promise<Map<string, T>> {
  const entities = await Promise.all(ids.map(fetcher))
  return buildEntityMap(entities)
}
