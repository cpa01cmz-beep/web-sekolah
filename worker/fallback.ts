export interface FallbackOptions<T> {
  fallback?: () => T | Promise<T>
  onFallback?: (error: Error) => void
  shouldFallback?: (error: Error) => boolean
}

export class FallbackHandler {
  static async withFallback<T>(
    primaryFn: () => Promise<T>,
    options: FallbackOptions<T> = {}
  ): Promise<T> {
    const { fallback, onFallback, shouldFallback } = options

    try {
      return await primaryFn()
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))

      if (shouldFallback && !shouldFallback(err)) {
        throw err
      }

      if (onFallback) {
        onFallback(err)
      }

      if (fallback) {
        const result = await fallback()
        return result
      }

      throw err
    }
  }

  static createStaticFallback<T>(value: T): () => T {
    return () => value
  }

  static createNullFallback<T>(): () => T | null {
    return () => null as T | null
  }

  static createEmptyArrayFallback<T>(): () => T[] {
    return () => [] as T[]
  }

  static createEmptyObjectFallback<T extends Record<string, unknown>>(): () => T {
    return () => ({}) as T
  }
}

export function withFallback<T>(
  primaryFn: () => Promise<T>,
  options: FallbackOptions<T> = {}
): Promise<T> {
  return FallbackHandler.withFallback(primaryFn, options)
}
